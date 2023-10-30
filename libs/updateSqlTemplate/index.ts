async function updateSqlTemplate(sqlTemplate: String, valuesArray: Array): String {
  var valuesTemplate = '?'
  for (var index in valuesArray) {
    if (index > 0) valuesTemplate += ', ?'
  }
  return sqlTemplate.replace('{values}', valuesTemplate);
}

export default updateSqlTemplate;
