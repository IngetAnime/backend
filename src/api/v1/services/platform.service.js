import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc)

// CRUD Basic Platform

export const createPlatform = async (name) => {
  try {
    const platform = await prisma.platform.create({
      data: { name }
    })
    return platform
  } catch(err) {
    console.log('Error in the createPlatform service');
    if (err.code === "P2002") {
      throw new customError("Platform already exists", 409);
    }
    throw err;
  }
}

export const getPlatformDetail = async (id) => {
  try {
    const platform = await prisma.platform.findUnique({
      where: { id }
    })
    if (!platform) {
      throw new customError("Platform not found", 404);
    }
    return platform
  } catch(err) {
    console.log('Error in the getPlatformDetail service');
    throw err;
  }
}

export const updatePlatform = async (id, name) => {
  try {
    const platform = await prisma.platform.update({
      where: { id },
      data: {
        ...(name && { name })
      }
    })
    return platform
  } catch(err) {
    console.log('Error in the updatePlatform service');
    if (err.code === "P2025") {
      throw new customError("Platform not found", 404);
    } else if (err.code === "P2002") {
      throw new customError("Platform already exists", 409);
    }
    throw err;
  }
}

export const deletePlatform = async (id) => {
  try {
    const platform = await prisma.platform.delete({
      where: { id }
    })
    return platform
  } catch(err) {
    console.log('Error in the deletePlatform service');
    if (err.code === "P2025") {
      throw new customError("Platform not found", 404);
    }
    throw err;
  }
}

export const getPlatforms = async () => {
  try {
    const platforms = await prisma.platform.findMany()
    return platforms
  } catch(err) {
    console.log('Error in the getPlatforms service');
    throw err;
  }
}

// CRUD Anime Platform

const setUpMainPlatform = async (animeId) => {
  await prisma.animePlatform.updateMany({
    where: { animeId },
    data: { isMainPlatform: false }
  })
}

export const createAnimePlatform = async (
  animeId, platformId, link, accessType, nextEpisodeAiringAt, 
  lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform
) => {
  try {
    if (isMainPlatform) {
      await setUpMainPlatform(animeId)
    }
    const animePlatform = await prisma.animePlatform.create({
      data: {
        animeId, platformId, link, accessType,
        ...(lastEpisodeAiredAt && { lastEpisodeAiredAt: dayjs(lastEpisodeAiredAt).toISOString() }),
        ...(nextEpisodeAiringAt && { nextEpisodeAiringAt: dayjs(nextEpisodeAiringAt).toISOString() }),
        ...(intervalInDays && { intervalInDays }),
        ...(episodeAired && { episodeAired }),
        ...(isMainPlatform && { isMainPlatform }),
      }, 
      include: {
        anime: true, platform: true
      }
    })
    return animePlatform
  } catch(err) {
    console.log('Error in the createAnimePlatform service');
    if (err.code === "P2003") {
      throw new customError("Anime or platform not found", 404);
    } else if (err.code === "P2002") {
      throw new customError("Anime platform already exists", 409);
    }
    throw err;
  }
}

export const getAnimePlatformDetail = async (animeId, platformId) => {
  try {
    const animePlatform = await prisma.animePlatform.findUnique({ 
      where: { 
        platformId_animeId : { platformId, animeId }
      },
      include: {
        anime: true, platform: true
      }
    })
    if (!animePlatform) {
      throw new customError('Anime platform not found', 404);
    }
    return animePlatform
  } catch(err) {
    console.log('Error in the getAnimePlatformDetail service');
    throw err;
  }
}

export const updateAnimePlatform = async (
  animeId, platformId, link, accessType, nextEpisodeAiringAt, 
  lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform
) => {
  try {
    lastEpisodeAiredAt = lastEpisodeAiredAt === null ? null : dayjs(lastEpisodeAiredAt).toISOString()
    nextEpisodeAiringAt = nextEpisodeAiringAt === null ? null : dayjs(nextEpisodeAiringAt).toISOString()
    if (isMainPlatform) {
      await setUpMainPlatform(animeId)
    }
    const animePlatform = await prisma.animePlatform.update({
      where: { platformId_animeId: { platformId, animeId } },
      data: {
        link, accessType, lastEpisodeAiredAt, nextEpisodeAiringAt, intervalInDays, episodeAired, isMainPlatform
      }, 
      include: {
        anime: true, platform: true
      }
    })
    return animePlatform
  } catch(err) {
    console.log('Error in the updateAnimePlatform service');
    if (err.code === "P2025") {
      throw new customError("Anime platform not found", 404);
    } else if (err.code === "P2002") {
      throw new customError("Anime platform already exists", 409);
    }
    throw err;
  }
}

export const createOrUpdateAnimePlatform = async (
  animeId, platformId, link, accessType, nextEpisodeAiringAt, 
  lastEpisodeAiredAt, intervalInDays, episodeAired, isMainPlatform, isHiatus
) => {
  try {
    lastEpisodeAiredAt = lastEpisodeAiredAt ? dayjs(lastEpisodeAiredAt).toISOString() : lastEpisodeAiredAt
    nextEpisodeAiringAt = nextEpisodeAiringAt ? dayjs(nextEpisodeAiringAt).toISOString() : nextEpisodeAiringAt
    if (isMainPlatform) {
      await setUpMainPlatform(animeId)
    }

    let animePlatform, statusCode = 200;
    try {
      animePlatform = await prisma.animePlatform.update({
        where: { 
          platformId_animeId: { platformId, animeId } 
        },
        data: {
          ...(link && { link }),
          ...(accessType && { accessType }),
          ...((lastEpisodeAiredAt || lastEpisodeAiredAt === null) && { lastEpisodeAiredAt }),
          ...((nextEpisodeAiringAt || nextEpisodeAiringAt === null) && { nextEpisodeAiringAt }),
          ...(intervalInDays && { intervalInDays }),
          ...((episodeAired || episodeAired === 0) && { episodeAired }),
          ...((isMainPlatform || isMainPlatform === false) && { isMainPlatform }),
          ...((isHiatus || isHiatus === false) && { isHiatus }),
        },
        include: {
          anime: true, platform: true
        }
      })
    } catch(err) {
      if (err.code === "P2025") {
        statusCode = 201;
        if (!link || !accessType || !nextEpisodeAiringAt) {
          throw new customError(`Creating a new anime platform requires link, accessType, and nextEpisodeAiringAt`, 400)
        }
        animePlatform = await prisma.animePlatform.create({
          data: {
            animeId, platformId, link, accessType, nextEpisodeAiringAt: dayjs(nextEpisodeAiringAt).toISOString(),
            ...(lastEpisodeAiredAt && { lastEpisodeAiredAt }),
            ...(intervalInDays && { intervalInDays }),
            ...(episodeAired && { episodeAired }),
            ...(isMainPlatform && { isMainPlatform }),
            ...(isHiatus && { isHiatus }),
          },
          include: {
            anime: true, platform: true
          }
        })
      } else {
        throw err;
      }
    }

    return { data: animePlatform, statusCode }
  } catch(err) {
    console.log('Error in the createOrUpdateAnimePlatform service');
    if (err.code === "P2003") {
      throw new customError("Anime platform not found", 404);
    } else if (err.code === "P2002") {
      throw new customError("Anime platform already exists", 409);
    }
    throw err;
  }
}

export const deleteAnimePlatform = async (animeId, platformId) => {
  try {
    const animePlatform = await prisma.animePlatform.delete({
      where: { 
        platformId_animeId: { platformId, animeId } 
      },
      include: { 
        anime: true, platform: true
      }
    })

    return animePlatform
  } catch(err) {
    console.log('Error in the deleteAnimePlatform service');
    if (err.code === "P2025") {
      throw new customError("Anime platform not found", 404);
    }
    throw err;
  }
}

export const getAnimePlatforms = async (animeId) => {
  try {
    const animePlatforms = await prisma.animePlatform.findMany({
      where: { animeId },
      include: { anime: true, platform: true }
    })

    return animePlatforms
  } catch(err) {
    console.log('Error in the getAnimePlatforms service');
    throw err;
  }
}