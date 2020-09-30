export interface UserInfo {
  id: string,
  classid: string | '未分班',
  name: string,
  gender: '男' | '女',
  birthday?: string,
  eduid?: string
}
