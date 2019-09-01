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
        var dataName = data;
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
  str = str.replace(/\d+rpx/g, function(a) {
    return Math.ceil(parseInt(a) / 2) + "px";
  });
  var s = '<style lang="less" scoped>' + str + "</style>";
  fs.writeFileSync(fileUrl + "/" + fileName.split(".")[0] + ".styl", s);
}

function replaceCss(fileContent, fileUrl, s, fileName) {
  var str = fileContent;
  str = str.replace(/image/g, "img");
  str = str.replace(/navigator/g, "a");
  str = str.replace(/\d+rpx/g, function(a) {
    return Math.ceil(parseInt(a) / 2) + "px";
  });
  var s = "<style scoped>" + str + "</style>";
  fs.writeFileSync(fileUrl + "/" + fileName.split(".")[0] + ".css", s);
}

function replaceHtml(fileContent, fileUrl, s, fileName) {
  var str = "<template>" + fileContent;
  // 标签类
  str = str.replace(/<image/g, "<img");
  str = str.replace(/<scroll-view/g, "<div");
  str = str.replace(/scroll-view>/g, "div>");
  str = str.replace(/<view/g, "<div");
  str = str.replace(/view>/g, "div>");
  str = str.replace(/<text/g, "<span");
  str = str.replace(/text>/g, "span>");
  str = str.replace(/<navigator/g, "<router-link");
  str = str.replace(/navigator>/g, "router-link>");
  str = str.replace(/<block/g, "<div");
  str = str.replace(/block>/g, "div>");

  // 属性类
  str = str.replace(/wx:if="{{[^}}]*}}"/g, function(val) {
    val = val.replace(/wx:if/g, "v-if");
    val = val.replace(/{{|}}/g, "");
    return val;
  });
  str = str.replace(/wx:else/g, "v-else");
  str = str.replace(/wx:elif="{{[^}}]*}}"/g, function(val) {
    val = val.replace(/wx:elif/g, "v-else-if");
    val = val.replace(/{{|}}/g, "");
    return val;
  });
  str = str.replace(/hidden="{{[^}}]*}}"/g, function(val) {
    val = val.replace(/hidden/g, ":hidden");
    val = val.replace(/{{|}}/g, "");
    return val;
  });
  str = str.replace(/src="{{[^}}]*}}"/g, function(val) {
    val = val.replace(/src/g, ":src");
    val = val.replace(/{{|}}/g, "");
    return val;
  });
  str = str.replace(/wx:for="{{[^}}]*}}"/g, function(val) {
    val = val.replace(/wx:for="{{/g, 'v-for= "(item,index) in ');
    val = val.replace(/{{|}}/g, "");
    return val;
  });
  str = str.replace(/wx:key="{{[^}}]*}}"/g, function(val) {
    val = val.replace(/wx:key/g, ":key");
    val = val.replace(/{{|}}/g, "");
    return val;
  });
  str = str.replace(/bindtap/g, "@click");
  str = str.replace(/catchtap/g, "@click.stop");
  str = str.replace(/bindinput/g, "@input");
  str = str.replace(/hover-class="none"/g, "");
  str = str.replace(/class=".* {{[^{{]*}}"/g, function(val) {
    var arr = val.split("{{");
    var static = arr[0] + '"';
    var dynamic = ' :class="' + arr[1];
    dynamic = dynamic.substring(0, dynamic.length - 3) + '"';
    return static + dynamic;
  });
  str = str.replace(/url=/g, "to=");

  //rpx转px
  str = str.replace(/\d+rpx/g, function(a) {
    return Math.ceil(parseInt(a) / 2) + "px";
  });

  str += "</template>";

  //新建文件
  fs.writeFileSync(fileUrl + "/" + fileName.split(".")[0] + ".vue", str);
}

module.exports = fileDisplay;
