import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import { formattedAnimeList } from "./animeList.service.js";
import { getUserAnimeList } from "./mal.service.js";

dayjs.extend(utc)

export const getUserDetail = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw new customError('User not found', 404);
    }
    return { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      isVerified: user.isVerifed, 
      role: user.role,
      ...(user.picture && { picture: user.picture }), 
    };
  } catch(err) {
    console.log('Error in the getUserDetail service');
    throw err;
  }
}

export const getAnimeList = async (userId, status, sort) => {
  // Query normalization
  status = status ? status.split(',') : undefined;
  switch (sort) {
    case 'list_score':
      sort = [
        { score: 'desc' },
        { anime: { title: 'asc' } }
      ];
      break;
    case 'list_updated_at':
      sort = {
        updatedAt: 'desc'
      }
      break;
    case 'anime_title':
      sort = {
        anime: {
          title: 'asc'
        }
      }
      break;
    case 'anime_start_date':
      sort = {
        anime: {
          releaseAt: 'desc'
        }
      }
      break;
    default:
      sort = {
        anime: {
          id: 'asc'
        }
      }
      break;
  }
  
  try {
    let animeList = await prisma.animeList.findMany({
      where: {
        userId, 
        ...(status && {
          status: { in: status }
        })
      },
      include: {
        anime: {
          include: {
            platforms: {
              orderBy: { isMainPlatform: 'desc' },
              include: { platform: true }
            }
          }
        },
        platform: {
          include: { 
            platform: true 
          }
        }
      },
      orderBy: sort
    })

    animeList = animeList.map((list) => {
      const episodeAired = 
        list.platform?.episodeAired || 
        list.anime.platforms[0]?.episodeAired || 
        (list.anime.status === 'finished_airing' ? list.anime.episodeTotal : null);
      const remainingWatchableEpisodes = episodeAired ? (episodeAired - list.progress) : null;
      return {
        ...formattedAnimeList(list), // Convert startDate and finishDate to YYYY-MM-DD
        remainingWatchableEpisodes,
      }
    });

    if (!animeList.length) {
      throw new customError(`User anime list not found`, 404);
    }

    return animeList;
  } catch(err) {
    console.log('Error in the getAnimeList service');
    throw err;
  }
}

export const importAnimeList = async (userId, isSyncedWithMal, type) => {
  try {
    let isLeft = true, limit = 100, offset = 0, userAnimeList = [];
    while (isLeft) {
      let animeListFromMAL = await getUserAnimeList(userId, undefined, undefined, limit, offset, 'my_list_status')
      userAnimeList.push(...animeListFromMAL.data)
      if (!animeListFromMAL.paging?.next) {
        break;
      }
      offset += limit
    }

    let result;
    if (type === 'skip_duplicates') {
      result = await prisma.animeList.createMany({
        data: userAnimeList.map(anime => {
          return {
            userId: userId,
            animeId: anime.id,
            startDate: anime.my_list_status.start_date ? dayjs.utc(anime.my_list_status.start_date) : null,
            finishDate: anime.my_list_status.finish_date ? dayjs.utc(anime.my_list_status.finish_date) : null,
            progress: anime.my_list_status.num_episodes_watched,
            score: anime.my_list_status.score,
            status: anime.my_list_status.status,
            updatedAt: dayjs.utc(anime.my_list_status.updated_at),
            ...(isSyncedWithMal && { isSyncedWithMal })
          }
        }),
        skipDuplicates: true,
      })
    } else {
      let resultLength = 0;
      result = await Promise.all(
        userAnimeList.map(anime => {
          const update = {
            userId: userId,
            animeId: anime.id,
            animePlatformId: anime.myListStatus?.animePlatformId,
            startDate: anime.my_list_status.start_date ? dayjs.utc(anime.my_list_status.start_date) : null,
            finishDate: anime.my_list_status.finish_date ? dayjs.utc(anime.my_list_status.finish_date) : null,
            progress: anime.my_list_status.num_episodes_watched,
            score: anime.my_list_status.score,
            episodesDifference: anime.myListStatus?.episodesDifference,
            status: anime.my_list_status.status,
            updatedAt: dayjs.utc(anime.my_list_status.updated_at),
            ...(isSyncedWithMal || isSyncedWithMal === false && { isSyncedWithMal })
          }
          
          const create = {
            userId: userId,
            animeId: anime.id,
            startDate: anime.my_list_status.start_date ? dayjs.utc(anime.my_list_status.start_date) : null,
            finishDate: anime.my_list_status.finish_date ? dayjs.utc(anime.my_list_status.finish_date) : null,
            progress: anime.my_list_status.num_episodes_watched,
            score: anime.my_list_status.score,
            status: anime.my_list_status.status,
            updatedAt: dayjs.utc(anime.my_list_status.updated_at),
            ...(isSyncedWithMal && { isSyncedWithMal })
          }
  
          if (type === 'overwrite_all') {
            resultLength += 1;
            return prisma.animeList.upsert({
              where: { 
                userId_animeId: { userId, animeId: anime.id } 
              },
              update: update,
              create: create,
            })
          } else if (type === 'latest_updated') {
            if (!anime.myListStatus.updatedAt || dayjs(anime.my_list_status.updated_at).isAfter(dayjs(anime.myListStatus.updatedAt))) {
              resultLength += 1
            }
            return prisma.animeList.upsert({
              where: { 
                userId_animeId: { userId, animeId: anime.id } 
              },
              update: {
                ...(
                  dayjs(anime.my_list_status.updated_at).isAfter(dayjs(anime.myListStatus.updatedAt)) && update
                )
              },
              create: create,
            })
          }
        })
      )
      result = { count: resultLength }
    }

    return { ...result };
  } catch(err) {
    console.log('Error in the importAnimeList service');
    throw err;
  }
}