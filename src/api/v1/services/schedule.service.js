import cron from 'node-cron';
import prisma from '../utils/prisma.js';
import customError from '../utils/customError.js';
import { getTimeline as getBstationTimeline } from '../utils/bstation.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { sendBstationScheduleReport } from '../utils/mailer.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// CRON Scheduler

export const platformScheduler = () => {
  cron.schedule('* * * * *', async () => {
    // Check on queue schedule
    const animePlatform = await prisma.animePlatform.findMany({
      where: {
        isHiatus: false,
        nextEpisodeAiringAt: { lte: dayjs().toISOString() }
      }, 
      orderBy: {
        nextEpisodeAiringAt: 'asc'
      },
      include: { 
        anime: true 
      }
    })

    if (animePlatform.length > 0) {
      for (const platform of animePlatform) {
        const startTime = Date.now();

        let lastEpisodeAiredAt = dayjs(platform.nextEpisodeAiringAt).toISOString();
        let nextEpisodeAiringAt = dayjs(platform.nextEpisodeAiringAt).add(platform.intervalInDays, 'day').toISOString();
        let isHiatus = false;

        if (platform.anime.episodeTotal === (platform.episodeAired + 1)) { // If current episode is last episode
          nextEpisodeAiringAt = lastEpisodeAiredAt;
          isHiatus = true;
  
          if (platform.anime.status === 'currently_airing') { // Set to finish if still airing
            await prisma.anime.update({
              where: { id: platform.animeId },
              data: {
                status: 'finished_airing'
              }
            })
          }
        }
        
        // Update platform lastEpisodeAiredAt and nextEpisodeAiringAt 
        await prisma.animePlatform.update({
          where: { id: platform.id },
          data: {
            episodeAired: platform.episodeAired + 1, lastEpisodeAiredAt, nextEpisodeAiringAt, isHiatus
          }
        })

        // Update anime to currently_airing if first airing
        if ((platform.episodeAired === 0) && platform.anime.status === 'not_yet_aired') {
          await prisma.anime.update({
            where: { id: platform.animeId },
            data: {
              status: 'currently_airing'
            }
          })
        }

        const elapsed = Date.now() - startTime;
        console.log(`Platform with id ${platform.id} updated! in ${elapsed} ms`);
      }
    }
  })
}

export const bstationTimelineScheduler = async (timeZone='Asia/Jakarta') => {
  cron.schedule('* * * * *', async () => {
    console.log(`Start bstation timeline scraping at: ${dayjs().toISOString()}`);
    
    const BSTATION_ID = 1;
    const TODAY = dayjs();
    const NEXT_WEEK = dayjs().tz(timeZone).add(7, 'day').startOf('day');

    const allScrape = await getBstationTimeline();
    const upcomingScrape = allScrape.filter(item => dayjs(item.releaseAt).isAfter(TODAY));
    const mapToLink = new Map(upcomingScrape.map(d => [d.link, { ...d }]))

    const animePlatform = await prisma.animePlatform.findMany({
      where: {
        platformId: BSTATION_ID,
        OR: [
          { nextEpisodeAiringAt: null },
          { nextEpisodeAiringAt: { gte: TODAY } }
        ]
      }
    })

    let updatedPlatforms = [];
    for (const platform of animePlatform) {
      const dataScrape = mapToLink.get(platform.link);

      // If on Bstation timeline exist, but null on database
      if (dataScrape && (platform.nextEpisodeAiringAt === null)) {
        const data = await prisma.animePlatform.update({
          where: { id: platform.id },
          data: { nextEpisodeAiringAt: dayjs(dataScrape.releaseAt).toISOString() },
          include: {
            anime: {
              select: { title: true, picture: true }
            }
          }
        })

        updatedPlatforms.push({
          title: data.anime.title,
          picture: data.anime.picture,
          episodeNumber: dataScrape.episodeNumber,
          newDate: dataScrape.releaseAt,
          type: 'Added'
        });
      } 
      
      // If on bstation timeline exist, but different than database
      else if ( dataScrape && !(dayjs(platform.nextEpisodeAiringAt).isSame(dayjs(dataScrape.releaseAt))) ) {
        const data = await prisma.animePlatform.update({
          where: { id: platform.id },
          data: { nextEpisodeAiringAt: dayjs(dataScrape.releaseAt).toISOString() },
          include: {
            anime: {
              select: { title: true, picture: true }
            }
          }
        });

        updatedPlatforms.push({
          title: data.anime.title,
          picture: data.anime.picture,
          episodeNumber: dataScrape.episodeNumber,
          newDate: dataScrape.releaseAt,
          type: 'Updated'
        });
      } 
      
      // If on bstation timeline not exist, but exist on database (only on bstation timeline range - next 6 days)
      else if ( !dataScrape && dayjs(platform.nextEpisodeAiringAt).isBefore(NEXT_WEEK) ) {
        const data = await prisma.animePlatform.update({
          where: { id: platform.id },
          data: { nextEpisodeAiringAt: null },
          include: {
            anime: {
              select: { title: true, picture: true }
            }
          }
        });

        updatedPlatforms.push({
          title: data.anime.title,
          picture: data.anime.picture,
          episodeNumber: platform.episodeAired + 1,
          newDate: null,
          type: 'Removed'
        });
      }
    }
    
    console.log(updatedPlatforms);
    console.log(`End bstation timeline scraping at: ${dayjs().toISOString()}`);
    // await sendBstationScheduleReport(process.env.MAILER_USER, updatedPlatforms);
  }, {
    timezone: timeZone
  })
}