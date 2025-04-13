import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import dayjs from "dayjs";

// CRUD Platform

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

// CRUD Scheduler
export const createOrUpdatePlatformSchedule = async (platformId, episodeNumber, updateOn) => {
  try {
    let schedule;
    let statusCode = 200;
    const schedulerBefore = await prisma.platformSchedule.findUnique({
      where: {
        platformId_episodeNumber: {
          platformId, episodeNumber: episodeNumber - 1
        }
      }
    })
    const schedulerAfter = await prisma.platformSchedule.findUnique({
      where: {
        platformId_episodeNumber: {
          platformId, episodeNumber: episodeNumber + 1
        }
      }
    })
    if (schedulerBefore &&  dayjs(schedulerBefore.updateOn).isAfter(updateOn)) {
      throw new customError(
        `Update date ${updateOn} cannot be earlier than the previous episode on ${schedulerBefore.updateOn}`, 400
      )
    } else if (schedulerAfter && dayjs(schedulerAfter.updateOn).isBefore(updateOn)) {
      throw new customError(
        `Update date ${updateOn} cannot be later than the next episode on ${schedulerAfter.updateOn}`, 400
      )
    } else if (!schedulerBefore && !schedulerAfter && episodeNumber !== 1) {
      throw new customError('Previous or next episode schedule must exist', 400)
    }

    try {
      schedule = await prisma.platformSchedule.update({
        where: { 
          platformId_episodeNumber: {
            platformId, episodeNumber
          }
        },
        data: {
          updateOn: dayjs(updateOn).toISOString(),
        },
        include: { 
          platform: { 
            include: { anime: true }
          }
        }
      });
    } catch(err) {
      if (err.code === "P2025") {
        statusCode = 201;
        schedule = await prisma.platformSchedule.create({
          data: { platformId, episodeNumber, updateOn },
          include: { 
            platform: { 
              include: { anime: true }
            }
          }
        });
      } else {
        throw err;
      }
    }

    return { statusCode, ...schedule };
  } catch(err) {
    console.log('Error in the createOrUpdatePlatformSchedule service', err);
    if (err.code === "P2003") {
      throw new customError("Platform not found", 404);
    }
    throw err;
  }
}

export const getPlatformSchedule = async (platformId) => {
  try {
    const schedule = await prisma.platformSchedule.findMany({
      where: { platformId },
      include: { 
        platform: { 
          include: { anime: true }
        }
      }
    })
    if (!schedule) {
      throw new customError('Platform schedule not found', 404);
    }
    return { ...schedule }
  } catch(err) {
    console.log('Error in the getPlatformSchedule service', err);
    throw err;
  }
}

// console.log((await createOrUpdatePlatformSchedule(12, 3, '2025-04-20T08:30:00.000Z')))
// console.log((await getPlatformSchedule(12)));
