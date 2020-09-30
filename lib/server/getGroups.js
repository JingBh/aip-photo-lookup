module.exports = async (client) => {
  const result = await client.getGrouplist({
    length: 20
  })
  return result.result.group_id_list
}
