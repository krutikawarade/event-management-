import conferenceImg from "../images/conference.jpg";
import meetingImg from "../images/meeting.jpg";
import collegeImg from "../images/college.jpg";
import hackathonImg from "../images/hackathon.jpg";
import marathonImg from "../images/marathon.jpg";
import yogaImg from "../images/yoga.jpg";
import liveconsertImg from "../images/liveconcert.jpg";
import danceImg from "../images/dance.jpg";
import musicImg from "../images/music.jpg";

const IMAGE_MAP = {
  conference: conferenceImg,
  meeting: meetingImg,
  college: collegeImg,
  hackathon: hackathonImg,
  marathon: marathonImg,
  yoga: yogaImg,
  liveconcert: liveconsertImg,
  dance: danceImg,
  music: musicImg,
};

export const AVAILABLE_IMAGE_KEYS = Object.keys(IMAGE_MAP);

export function imageForKey(imageKey) {
  return IMAGE_MAP[imageKey] || conferenceImg;
}

export function attachImages(events) {
  return events.map((e) => ({
    ...e,
    image:
      e.customImage != null
        ? e.customImage || null
        : e.imageKey
          ? imageForKey(e.imageKey)
          : null,
  }));
}
