//将rgb颜色对象转换为颜色字符串返回
export function Color2Str(rgb){
    return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + rgb.a + ")";
}