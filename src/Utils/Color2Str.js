//将rgb颜色对象转换为颜色字符串返回
export function Color2Str(rgb){
    if(!rgb || typeof(rgb) === 'undefined' || typeof(rgb) === 'string'){
        return "transparent"
    }
    return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + rgb.a + ")";
}