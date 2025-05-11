import prisma from "../utils/prisma.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import customError from '../utils/customError.js';
import { deleteMyAnimeListItem, updateMyAnimeListStatus } from "./mal.service.js";

dayjs.extend(utc)

const updateToMAL = async (animeList) => {
  let startDate = animeList.startDate ? dayjs.utc(animeList.startDate).format('YYYY-MM-DD')  : animeList.startDate;
  let finishDate = animeList.finishDate ? dayjs.utc(animeList.finishDate).format('YYYY-MM-DD')  : animeList.finishDate;
  await updateMyAnimeListStatus(
    animeList.userId, animeList.anime.malId, animeList.status, animeList.score, animeList.progress, startDate, finishDate
  )
}

const deleteFromMAL = async (animeList) => {
  try {
    await deleteMyAnimeListItem(animeList.userId, animeList.anime.malId)
  } catch(err) {
    console.log(err.message);
  }
}

export const formattedAnimeList = (animeList) => {
  if (animeList.startDate) {
    animeList.startDate = dayjs.utc(animeList.startDate).format('YYYY-MM-DD')
  }
  if (animeList.finishDate) {
    animeList.finishDate = dayjs.utc(animeList.finishDate).format('YYYY-MM-DD')
  }
  if (animeList.anime.releaseAt) {
    animeList.anime.releaseAt = dayjs.utc(animeList.anime.releaseAt).format('YYYY-MM-DD')
  }
  return animeList;
}

// Basic CRUD AnimeList

export const createAnimeList = async (
  userId, animeId, animePlatformId, startDate, finishDate,
  progress, score, episodesDifference, status, isSyncedWithMal
) => {
  try {
    const animeList = await prisma.animeList.create({
      data: {
        userId, animeId,
        ...((animePlatformId === null || animePlatformId)  && { animePlatformId }),
        ...(
          startDate === null ? { startDate: null } : 
          startDate ? { startDate: dayjs.utc(startDate) } : {}
        ),
        ...(
          finishDate === null ? { finishDate: null } : 
          finishDate ? { finishDate: dayjs.utc(finishDate) } : {}
        ),
        ...((progress === 0 || progress) && { progress }),
        ...((score === 0 || score) && { score }),
        ...((episodesDifference === 0 || episodesDifference) && { episodesDifference }),
        ...(status && { status }),
        ...(
          isSyncedWithMal ? { isSyncedWithMal: true } : 
          isSyncedWithMal === false ? { isSyncedWithMal: false } : {}
        ),
      }, include: {
        anime: true, platform: {
          include: {
            platform: true
          }
        }
      }
    });

    if (animeList.isSyncedWithMal) {
      await updateToMAL(animeList)
    }

    return formattedAnimeList(animeList);
  } catch(err) {
    console.log('Error in the createAnimeList service');
    if (err.code === 'P2002') {
      throw new customError('Anime list already exists', 409);
    } else if (err.code === 'P2003') {
      throw new customError("Anime or platform not found", 404);
    }
    throw err;
  }
}

export const getAnimeListDetail = async (userId, animeId) => {
  try {
    const animeList = await prisma.animeList.findUnique({
      where: {
        userId_animeId: { userId, animeId } 
      },
      include: {
        anime: true, platform: {
          include: {
            platform: true
          }
        }
      }
    })
    if (!animeList) {
      throw new customError('Anime list not found', 404);
    }
    return formattedAnimeList(animeList)
  } catch(err) {
    console.log('Error in the getAnimeListDetail service', err);
    throw err;
  }
}

export const updateAnimeList = async (
  userId, animeId, animePlatformId, startDate, finishDate,
  progress, score, episodesDifference, status, isSyncedWithMal
) => {
  try {
    const animeList = await prisma.animeList.update({
      where: {
        userId_animeId: { userId, animeId }
      },
      data: {
        animePlatformId, 
        ...(startDate === null ? { startDate: null } : { startDate: dayjs.utc(startDate) }),
        ...(finishDate === null ? { finishDate: null } : { finishDate: dayjs.utc(finishDate) }),
        progress, score, episodesDifference, status, isSyncedWithMal
      }, include: {
        anime: true, platform: {
          include: {
            platform: true
          }
        }
      }
    });

    if (animeList.isSyncedWithMal) {
      await updateToMAL(animeList)
    }

    return formattedAnimeList(animeList);
  } catch(err) {
    console.log('Error in the updateAnimeList service');
    if (err.code === 'P2003') {
      throw new customError("Platform not found", 404);
    } else if (err.code === 'P2025') {
      throw new customError("Anime list not found", 404)
    }
    throw err;
  }
}

export const createOrUpdateAnimeList = async (
  userId, animeId, animePlatformId, startDate, finishDate,
  progress, score, episodesDifference, status, isSyncedWithMal
) => {
  try {
    let animeList;
    let statusCode = 200;
    try {
      animeList = await prisma.animeList.update({
        where: { 
          userId_animeId: { userId, animeId }
        },
        data: {
          ...((animePlatformId === null || animePlatformId)  && { animePlatformId }),
          ...(
            startDate === null ? { startDate: null } : 
            startDate ? { startDate: dayjs.utc(startDate) } : {}
          ),
          ...(
            finishDate === null ? { finishDate: null } : 
            finishDate ? { finishDate: dayjs.utc(finishDate) } : {}
          ),
          ...((progress === 0 || progress) && { progress }),
          ...((score === 0 || score) && { score }),
          ...((episodesDifference === 0 || episodesDifference) && { episodesDifference }),
          ...(status && { status }),
          ...(
            isSyncedWithMal ? { isSyncedWithMal: true } : 
            isSyncedWithMal === false ? { isSyncedWithMal: false } : {}
          ),
        },
        include: {
          anime: true, platform: {
            include: {
              platform: true
            }
          }
        }
      });
    } catch(err) {
      if (err.code === "P2025") {
        statusCode = 201;
        animeList = await prisma.animeList.create({
          data: {
            userId, animeId,
            ...((animePlatformId === null || animePlatformId)  && { animePlatformId }),
            ...(
              startDate === null ? { startDate: null } : 
              startDate ? { startDate: dayjs.utc(startDate) } : {}
            ),
            ...(
              finishDate === null ? { finishDate: null } : 
              finishDate ? { finishDate: dayjs.utc(finishDate) } : {}
            ),
            ...((progress === 0 || progress) && { progress }),
            ...((score === 0 || score) && { score }),
            ...((episodesDifference === 0 || episodesDifference) && { episodesDifference }),
            ...(status && { status }),
            ...(
              isSyncedWithMal ? { isSyncedWithMal: true } : 
              isSyncedWithMal === false ? { isSyncedWithMal: false } : {}
            ),
          },
          include: {
            anime: true, platform: {
              include: {
                platform: true
              }
            }
          }
        });
      } else {
        throw err;
      }
    }

    if (animeList.isSyncedWithMal) {
      await updateToMAL(animeList)
    }

    return { data: formattedAnimeList(animeList), statusCode };
  } catch(err) {
    console.log('Error in the createOrUpdateAnimeList service', err);
    if (err.code === "P2003") {
      throw new customError("Anime or platform not found", 404);
    }
    throw err;
  }
}

export const deleteAnimeList = async (userId, animeId) => {
  try {
    const animeList = await prisma.animeList.delete({
      where: { 
        userId_animeId: { userId, animeId } 
      },
      include: {
        anime: true, platform: {
          include: {
            platform: true
          }
        }
      }
    })

    if (animeList.isSyncedWithMal) {
      await deleteFromMAL(animeList)
    }
    
    return formattedAnimeList(animeList)
  } catch(err) {
    console.log('Error in the deleteAnimeList service', err);
    if (err.code === "P2025") {
      throw new customError("Anime list not found", 404);
    }
    throw err;
  }
}

// console.log(await createAnimeList(21, 20, null, 2, undefined, null, undefined, 1, 'dropped', true))
// console.log(await createOrUpdateAnimeList(21, 20, null, '2025-05-03', null, 2, 0, 1, 'dropped', true))
// console.log(await getAnimeListDetail(21, 20))