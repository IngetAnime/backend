import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import dayjs from "dayjs";

export const createPlatform = async (
  animeId, name, link, accessType, nextEpisodeAiringAt, lastEpisodeAiredAt, icon, episodeAired
) => {
  try {
    const platform = await prisma.platform.create({
      data: {
        animeId, name, link, accessType, nextEpisodeAiringAt: dayjs(nextEpisodeAiringAt).toISOString(),
        ...(lastEpisodeAiredAt && { lastEpisodeAiredAt: dayjs(lastEpisodeAiredAt).toISOString() }),
        ...(icon && { icon }),
        ...(episodeAired && { episodeAired }),
      }, 
      include: { 
        anime: true 
      }
    })
    return { ...platform }
  } catch(err) {
    console.log('Error in the createPlatform service', err);
    if (err.code === "P2003") {
      throw new customError("Anime not found", 404);
    } else if (err.code === "P2002") {
      throw new customError("Platform already exists", 409);
    }
    throw err;
  }
}

export const getPlatformDetail = async (platformId) => {
  try {
    const platform = await prisma.platform.findUnique({
      where: { id: platformId },
      include: { anime: true }
    })
    if (!platform) {
      throw new customError('Platform not found', 404);
    }
    return { ...platform }
  } catch(err) {
    console.log('Error in the getPlatformDetail service', err);
    throw err;
  }
}

export const updatePlatrom = async (platformId, name, link, accessType, nextEpisodeAiringAt, lastEpisodeAiredAt, icon, episodeAired) => {
  try {
    const platform = await prisma.platform.update({
      where: { id: platformId },
      data: {
        ...(name && { name }),
        ...(link && { link }),
        ...(accessType && { accessType }),
        ...(nextEpisodeAiringAt && { nextEpisodeAiringAt: dayjs(nextEpisodeAiringAt).toISOString() }),
        ...(lastEpisodeAiredAt && { lastEpisodeAiredAt: dayjs(lastEpisodeAiredAt).toISOString() }),
        ...(icon && { icon }),
        ...(episodeAired && { episodeAired }),
      }, 
      include: { 
        anime: true 
      }
    })
    return { ...platform }
  } catch(err) {
    console.log('Error in the updatePlatrom service', err);
    if (err.code === "P2025") {
      throw new customError("Platform not found", 404);
    } else if (err.code === "P2002") {
      throw new customError("Platform with this link already exists", 409);
    }
    throw err;
  }
}

export const deletePlatform = async (platformId) => {
  try {
    const platform = await prisma.platform.delete({
      where: { id: platformId },
      include: { 
        anime: true 
      }
    })
    return { ...platform }
  } catch(err) {
    if (err.code === "P2025") {
      throw new customError("Platform not found", 404);
    }
    console.log('Error in the deletePlatform service', err);
    throw err;
  }
}

export const getAllPlatforms = async (
  animeId, name, accessType, 
  nextEpisodeAiringAtMinimum, nextEpisodeAiringAtMaximum, lastEpisodeAiredAtMinimum, lastEpisodeAiredAtMaximum,
  episodeAiredMinimum, episodeAiredMaximum, sortBy='nextEpisodeAiringAt', sortOrder='desc'
) => {
  try {
    accessType = accessType ? accessType.split(',') : [];
    const platform = await prisma.platform.findMany({
      where: { 
        ...(animeId && { animeId }),
        ...(name && {
          name: { contains: name, mode: 'insensitive' }
        }),
        ...(accessType?.length > 0 && {
          accessType: { in: accessType }
        }),
        ...(nextEpisodeAiringAtMinimum || nextEpisodeAiringAtMaximum
          ? {
              nextEpisodeAiringAt: {
                ...(nextEpisodeAiringAtMinimum && { gte: dayjs(nextEpisodeAiringAtMinimum).toISOString() }),
                ...(nextEpisodeAiringAtMaximum && { lte: dayjs(nextEpisodeAiringAtMaximum).toISOString() }),
              },
            }
          : {}
        ),
        ...(lastEpisodeAiredAtMinimum || lastEpisodeAiredAtMaximum
          ? {
              lastEpisodeAiredAt: {
                ...(lastEpisodeAiredAtMinimum && { gte: dayjs(lastEpisodeAiredAtMinimum).toISOString() }),
                ...(lastEpisodeAiredAtMaximum && { lte: dayjs(lastEpisodeAiredAtMaximum).toISOString() }),
              },
            }
          : {}
        ),
        ...(episodeAiredMinimum || episodeAiredMaximum
          ? {
              episodeAired: {
                ...(episodeAiredMinimum && { gte: episodeAiredMinimum }),
                ...(episodeAiredMaximum && { lte: episodeAiredMaximum }),
              },
            }
          : {}
        ),
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      include: { anime: true }
    })

    if (!platform) {
      throw new customError('Platform not found', 404);
    }
    return { ...platform }
  } catch(err) {
    console.log('Error in the getAllPlatforms service', err);
    throw err;
  }
}
// console.log(( await createPlatform(1, 'Bstation', 'https://www.bilibili.tv/id/play/2124917', 'limited_time', undefined, '2025-04-11T01:28:00:000', 2)));
// console.log(( await getPlatformDetail(1)));
// console.log(( await updatePlatrom(1, undefined, undefined, 'limited_time')));
// console.log(( await deletePlatform(1)));

// https://www.bilibili.tv/id/play/2124917
// 59160

// await prisma.anime.create({
//   data: {
//     malId: 58359,
//     title: 'Isshun de Chiryou shiteita noni Yakutatazu to Tsuihou sareta Tensai Chiyushi, Yami Healer toshite Tanoshiku Ikiru',
//     picture: "https://cdn.myanimelist.net/images/anime/1211/147335l.webp",
//     episodeTotal: 12,
//     status: 'currently_airing',
//   }
// })