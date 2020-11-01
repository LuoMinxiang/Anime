//按比例放大html字符串中文字的大小

export function ResizeFontSizeinHTMLStr(wrate, docum){
    const doc = docum.documentElement;
    //doc.addEventListener('DOMContentLoaded', Resize, false);
    // 当DOM加载后执行
    // 当屏幕发生变化时执行
    //function Resize()
    //{
        //div.style.width = "1500px";
        //div.style.left = "0px"; 
        //没有被span设置的固定标签
        doc.style.fontSize = (12 * wrate) + 'pt';
        //doc.style.fontSize=20 +'px'; //屏幕宽度为1366时 html font-size=20px;
        //68.3为1366/20计算得出的值，当编写浏览器发生变化时可用编写的浏览器宽度/20得出这个固定值;
                    
        //获取文字中全部的span标签
        const spanall=document.getElementsByTagName('span');
        //给每个span标签加id
        for(let i=0;i<spanall.length;i++)
        {
            spanall[i].id=i;
        }

        //var reg = /^(?=.*\d.*\b)/;
        for(let i=0;i<spanall.length;i++)
        {
            //获取每个span标签的fontsize
            const s=document.getElementById(i).style.fontSize;
            //将带单位的fontsize字符串截取成不带单位的fontsize字符串
            const index = s.lastIndexOf("p")
            //改变该span标签的fontsize
            const size = parseInt(s.substring(0,index)) * wrate;
            //var size=parseInt(s)+5;
            document.getElementById(i).style.fontSize = size + "pt";
        }
    //}

}