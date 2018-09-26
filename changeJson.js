


function Transform(arr : Array) {
    var json=[];
   arr.map((item)=>json.push({url:item}))
    return json;
}


module.exports = {
    Transform: Transform,
}