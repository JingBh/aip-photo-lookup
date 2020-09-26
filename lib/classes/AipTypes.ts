/* eslint-disable camelcase */

export interface MatchUser {
  group_id: string,
  user_id: string,
  user_info: string,
  score: number
}

export interface Face {
  face_token: string,
  location: {
    left: number,
    top: number,
    width: number,
    height: number,
    rotation: number
  },
  user_list: MatchUser[]
}

export interface MultiSearchResponse {
  error_code: number,
  error_msg: string,
  log_id: number,
  timestamp: number,
  cached: number,
  result?: {
    face_num: number,
    face_list: Face[]
  }
}
