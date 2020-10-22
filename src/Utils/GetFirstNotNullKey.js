//得到数组中第一个非空内容项的下标
export function GetFirstNotNullKey(arr){
    let index = 0;
    for(;index < arr.length;index++){
        if(arr[index] !== null && typeof(arr[index]) !== 'undefined'){
            break;
        }
    }
    return index;
}