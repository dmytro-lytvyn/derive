async function replaceSqlTemplate(sqlTemplate: String, valuesArray: Array): String {
  var pos = -1;
  var lastFoundPos = -1;
  var resultStr = '';
  for (var index in valuesArray) {
    pos = sqlTemplate.indexOf('?', lastFoundPos+1);
    if (pos > -1) {
      var value = valuesArray[index]
      if (typeof value === 'string') {
        value = `'${value}'`;
      }
      resultStr += sqlTemplate.substring(lastFoundPos+1, pos) + value;
      lastFoundPos = pos;
    }
  }
  resultStr += sqlTemplate.substring(lastFoundPos+1);
  return resultStr;
}

export default replaceSqlTemplate;
