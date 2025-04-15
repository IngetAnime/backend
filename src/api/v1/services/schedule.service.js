import cron from 'node-cron';
import dayjs from 'dayjs';
import prisma from '../utils/prisma.js';
import customError from '../utils/customError.js'

// CRUD Platform Scheduler

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
          data: { platformId, episodeNumber, updateOn: dayjs(updateOn).toISOString() },
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

    if (schedule.platformId === schedule.platform.anime.platformId) { // Current platform same as anime main platform
      if (schedule.episodeNumber === 1) { 
        // If first episode, create currently_airing anime schedule
        await createOrUpdateAnimeSchedule(schedule.platform.animeId, 'currently_airing', schedule.updateOn)
      } else if(schedule.episodeNumber === schedule.platform.anime.episodeTotal) { 
        // If last episode, create finished_airing anime schedule
        await createOrUpdateAnimeSchedule(schedule.platform.animeId, 'finished_airing', schedule.updateOn)
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

export const getPlatformScheduleById = async (id) => {
  try {
    const schedule = await prisma.platformSchedule.findUnique({
      where: { id: id },
      include: { 
        platform: { 
          include: { anime: true }
        }
      }
    })
    if (!schedule) {
      throw new customError('Platform schedule not found', 404);
    }
    return { ...schedule };
  } catch(err) {
    console.log('Error in the getPlatformScheduleById service', err);
    throw err;
  }
}

export const deletePlatformScheduleById = async (id) => {
  try {
    const schedule = await prisma.platformSchedule.delete({
      where: { id },
      include: { 
        platform: { 
          include: { anime: true }
        }
      }
    })
    return { ...schedule }
  } catch(err) {
    if (err.code === "P2025") {
      throw new customError("Platform schedule not found", 404);
    }
    console.log('Error in the deletePlatformScheduleById service', err);
    throw err;
  }
}

// CRUD Anime Scheduler

export const createOrUpdateAnimeSchedule = async (animeId, status, updateOn) => {
  try {
    let schedule;
    let statusCode = 200;
    try {
      schedule = await prisma.animeSchedule.update({
        where: { 
          animeId_status: {
            animeId, status
          }
        },
        data: {
          updateOn: dayjs(updateOn).toISOString(),
        },
        include: {
          anime: { 
            include: { mainPlatform: true }
          }
        }
      });
    } catch(err) {
      if (err.code === "P2025") {
        statusCode = 201;
        schedule = await prisma.animeSchedule.create({
          data: { animeId, status, updateOn: dayjs(updateOn).toISOString() },
          include: { 
            anime: { 
              include: { mainPlatform: true }
            }
          }
        });
      } else {
        throw err;
      }
    }

    return { statusCode, ...schedule };
  } catch(err) {
    console.log('Error in the createOrUpdateAnimeSchedule service', err);
    if (err.code === "P2003") {
      throw new customError("Anime not found", 404);
    }
    throw err;
  }
}

export const getAnimeSchedule = async (animeId) => {
  try {
    const schedule = await prisma.animeSchedule.findMany({
      where: { animeId },
      include: { 
        anime: { 
          include: { mainPlatform: true }
        }
      }
    })
    if (!schedule) {
      throw new customError('Anime schedule not found', 404);
    }
    return { ...schedule }
  } catch(err) {
    console.log('Error in the getAnimeSchedule service', err);
    throw err;
  }
}

export const getAnimeScheduleById = async (id) => {
  try {
    const schedule = await prisma.animeSchedule.findUnique({
      where: { id },
      include: { 
        anime: { 
          include: { mainPlatform: true }
        }
      }
    })
    if (!schedule) {
      throw new customError('Anime schedule not found', 404);
    }
    return { ...schedule };
  } catch(err) {
    console.log('Error in the getAnimeScheduleById service', err);
    throw err;
  }
}

export const deleteAnimeScheduleById = async (id) => {
  try {
    const schedule = await prisma.animeSchedule.delete({
      where: { id },
      include: { 
        anime: { 
          include: { mainPlatform: true }
        }
      }
    })
    return { ...schedule }
  } catch(err) {
    console.log('Error in the deleteAnimeScheduleById service', err);
    if (err.code === "P2025") {
      throw new customError("Anime schedule not found", 404);
    }
    throw err;
  }
}

// CRON Scheduler

export const platformScheduler = () => {
  cron.schedule('* * * * *', async () => {
    // Check on queue schedule
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
        // Next episode schedule
        const { updateOn } = await prisma.platformSchedule.findUnique({
          where: {
            platformId_episodeNumber: {
              platformId: schedule.platformId,
              episodeNumber: schedule.episodeNumber + 1
            }
          }
        });

        // Update platform lastEpisodeAiredAt and nextEpisodeAiringAt 
        await prisma.platform.update({
          where: { id: schedule.platformId },
          data: {
            episodeAired: schedule.episodeNumber,
            lastEpisodeAiredAt: dayjs(schedule.updateOn).toISOString(),
            ...(updateOn && { nextEpisodeAiringAt: dayjs(updateOn).toISOString() })
          }
        })

        // Set schedule to already updated
        await prisma.platformSchedule.update({
          where: { id: schedule.id },
          data: { isUpdated: true }
        })

        console.log(`Platform with id ${schedule.platformId} updated!`);
      })
    }
  })
}

export const animeScheduler = () => {
  // Check on queue schedule
  cron.schedule('* * * * *', async () => {
    const schedules = await prisma.animeSchedule.findMany({
      where: {
        AND: [
          { isUpdated: false },
          { updateOn: { lte: dayjs().toISOString() } }
        ]
      }, orderBy: {
        status: 'asc',
      }
    });

    if (schedules.length > 0) {
      schedules.forEach(async (schedule) => {
        // Update anime status
        await prisma.anime.update({
          where: { id: schedule.animeId },
          data: {
            status: schedule.status
          }
        })

        // Set schedule to already updated
        await prisma.animeSchedule.update({
          where: { id: schedule.id },
          data: { isUpdated: true }
        })

        console.log(`Anime with id ${schedule.animeId} updated!`);
      })
    }
  })
}