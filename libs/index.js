var fs = require("fs");
var path = require("path"); //解析需要遍历的文件夹

function fileDisplay(dir) {
  dir = dir || "./pages";
  var filePath = path.resolve(dir);
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function(err, files) {
    if (err) {
      console.warn(err);
    } else {
      //遍历读取到的文件列表
      files.forEach(function(filename) {
        //获取当前文件的绝对路径
        var s = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(s, function(eror, stats) {
          if (eror) {
            console.warn("获取文件stats失败");
          } else {
            var isFile = stats.isFile(); //是文件
            var isDir = stats.isDirectory(); //是文件夹
            if (isFile) {
              getFile(s, path.resolve(s, ".."), filename);
            }
            if (isDir) {
              fileDisplay(s); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        });
      });
    }
  });
}

function getFile(flieName, ord, filename) {
  fs.readFile(flieName, "utf8", function(err, data) {
    if (err) {
      console.warn(err);
    } else {
      //html部分转换
      if (flieName.indexOf("wxml") != -1) {
        var dataName = "<template><div>" + data;
        replaceHtml(dataName, ord, flieName, filename);
      }
      //css部分抓获
      if (flieName.indexOf("wxss") != -1) {
        replaceCss(data, ord, flieName, filename);
      }
      //less部分抓获
      if (flieName.indexOf("less") != -1) {
        replaceLess(data, ord, flieName, filename);
      }
    }
  });
}
function replaceLess(fileContent, fileUrl, s, fileName) {
  var str = fileContent;
  str = str.replace(/image/g, "img");
  str = str.replace(/navigator/g, "a");
  str = str.replace(/\d+rpx/g, function(a, b, c, d, e, f) {
    return (parseInt(a) / 75).toFixed(2) + "rem";
  });
  var s = "<style scoped>" + str + "</style>";
  fs.writeFileSync(fileUrl + "/" + fileName.split(".")[0] + ".styl", s);
}

function replaceCss(fileContent, fileUrl, s, fileName) {
  var str = fileContent;
  str = str.replace(/image/g, "img");
  str = str.replace(/navigator/g, "a");
  str = str.replace(/\d+rpx/g, function(a, b, c, d, e, f) {
    return (parseInt(a) / 75).toFixed(2) + "rem";
  });
  var s = "<style scoped>" + str + "</style>";
  fs.writeFileSync(fileUrl + "/" + fileName.split(".")[0] + ".css", s);
}

function replaceHtml(fileContent, fileUrl, s, fileName) {
  var str = fileContent;
  str = str.replace(/image/g, "img");
  str = str.replace(/view/g, "div");
  str = str.replace(/text/g, "span");
  str = str.replace(/bindtap/g, "@onclick");
  str = str.replace(/block/g, "template");
  str = str.replace(/wx:if/g, "v-show");
  str = str.replace(/src=\'\{\{/g, ":src='");
  str = str.replace(/wx\:key=\"\*this\"/g, " ");
  str = str.replace(/wx\:key\=\"index\"/g, " ");
  str = str.replace(/navigator/g, "router-link");
  str = str.replace(/wx:for="{{/g, 'v-for= "(item,index) in ');
  str = str.replace(/url\=\'..\//g, "to='");
  str = str.replace(/bindinput/g, "@input");

  //图片路径替换
  str = str.replace(/..\/..\/imgs/g, function(a, b, c, d, e, f) {
    return "../assets";
  });
  //rpx转rem
  str = str.replace(/\d+rpx/g, function(a, b, c, d, e, f) {
    return (parseInt(a) / 75).toFixed(2) + "rem";
  });

  str += "</div>";
  str += "</template>";
  str +=
    "<script>" +
    'import vue from "vue"' +
    "var vm = vue;" +
    "export default {" +
    'name:"' +
    fileName +
    '",' +
    " data() {return {}}, " +
    "methods: {} " +
    "}" +
    "</script>";
  //新建文件
  fs.writeFileSync(fileUrl + "/" + fileName.split(".")[0] + ".vue", str);
}

module.exports = fileDisplay;
