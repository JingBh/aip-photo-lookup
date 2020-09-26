module.exports = async (client) => {
  const result = await client.getGrouplist()
  return result.result.group_id_list
}
