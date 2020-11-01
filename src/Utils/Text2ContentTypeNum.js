import React from 'react'
export function Text2ContentTypeNum(text){
    let type = 1;
    switch(num){
        case "text":
            type = 1;
            break;
        case "image":
            type = 2;
            break;
        case "video": 
            type = 3;
            break;
        default:
            break;
    }
    return type;
}