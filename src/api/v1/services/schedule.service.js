import cron from 'node-cron';
import dayjs from 'dayjs';
import prisma from '../utils/prisma.js';

export const platformScheduler = () => {
  cron.schedule('* * * * *', async () => {
    const schedules = await prisma.platformSchedule.findMany({
      where: {
        AND: [
          { isUpdated: false },
          { updateOn: { lte: dayjs().toISOString() } }
        ]
      }, orderBy: {
        episodeNumber: 'asc',
      }
    });

    if (schedules.length > 0) {
      schedules.forEach(async (schedule) => {
        const { updateOn } = await prisma.platformSchedule.findUnique({
          where: {
            platformId_episodeNumber: {
              platformId: schedule.platformId,
              episodeNumber: schedule.episodeNumber + 1
            }
          }
        });
        await prisma.platform.update({
          where: { id: schedule.platformId },
          data: {
            episodeAired: schedule.episodeNumber,
            lastEpisodeAiredAt: dayjs(schedule.updateOn).toISOString(),
            ...(updateOn && { nextEpisodeAiringAt: dayjs(updateOn).toISOString() })
          }
        })
        await prisma.platformSchedule.update({
          where: { id: schedule.id },
          data: { isUpdated: true }
        })

        console.log(`Platform with id ${schedule.platformId} updated!`);
      })
    }
  })
}