1. 首页去掉添加活动，tab改成 一个是 未反馈的-跳转答题页面，已反馈-跳转到不可编辑的答题页面。
2. 答题时失去焦点，保存。ok
3. 提交答题后， 掉提交接口。提交完成页面返回到首页。ok
4. 答题页面可分享：参数：活动编号&分享者
5. 问卷页面增加微信授权登录逻辑。当从分享入口进入时先进行用户身份获取。 ok
6. form升级为 疫情使用最新的。 ok

item_type_attr属性:
选项 : radioType:'single'||'multi'  单选和多选
图片: fileNum:Number  值为数字,限制图片数量
数字:numberType:'number'||'digit' 整数和小数
日期:dateType:'date' ||'dateTime' ||'time'||'yearMonth'  日期,日期时间,时间,年月

**2020年3月5日09点03分-贾琦**
1. activityUpdate页面 问题上移下移删除 **ok**
2. 只有当问题类型为选项时 显示保存按钮 **ok**
3. 保存之后 拿到问题的no 隐藏保存按钮 
4. 增加活动发布按钮 点击后将未发布活动状态更改为进行中
5. 增加设置活动介绍和结束语的页面 
6. 预览问卷页面不显示提交按钮 **ok**
7. 数字类型保存接口提交到后台的是整数 返回来是保留三位小数 需排查原因
8. 新建活动(added)页面 处理enum类型的选项 处理value为null时显示字符串null **ok**
9. 新增问题为选项时显示选项类别选择，util.js中getCoulmnConfig函数增加选项类别(单选/多选)处理 **ok**

**2020年3月6日10点19分-贾琦**
* 新增问题类型为文本时，多行文本、maxlength模板 ok
* 隐藏新增问题弹框后 初始化新增问题表单默认值 ok
* 答题自动保存 ok
* 完善图片数量模板 数字类型(整数/浮点数)、数字最大值最小值模板

**2020年3月7日11点01分**
- ios分享失效问题定位 修复
- 活动时间过期时 后端会返回活动已结束  前端增加对应处理逻辑(调update接口将问卷采集状态改为已结束，并返回问卷列表页面)
- 点击提交按钮时活动状态检测不对 bug修复
- 完成问题选项修改功能 选项列表样式修改 值改变时显示修改按钮
- 问题选项编辑时单选/多选状态回显
- ckeckbox有保存值时不回显问题定位 修复
- radio未选择时有默认值问题定位 修复

**2020年3月9日08点36分**
- 修复新增问题时seq字段值不正常 ok
- 时间选择器startYear改为1900 ok
- 表单title字数过长时布局错乱 ok
- 数字最大值最小值无效 文本字数限制无效 ok
- 文本域增加字数统计 当前字数/最大字数
- 问卷底下增加两个按钮 我要创建、提交意见 ok
- 问卷列表增加跳转到查看已反馈和已查看人列表
- checkbox 宽高从默认26px改为22px
- 已反馈和已查看人列表点击跳转到对应问卷详情 ok(有bug，目前查回来的数据都是当前帐号提交的)

**2020年3月10日09点03分**
- 问卷页面底部增加二维码 ok
- 1、二维码改大，宽度占屏幕宽度的2/3左右；ok
- 2、西安百想科技  改为  百想科技； ok
- 3、“长按下方二维码，识别关注公众号”上面加一行“为了及时获取最新信息” ok
- 4、我反馈的，对应的查看和反馈人数不允许点进去看列表；ok
- 5、单选和多选的圆圈和方框再稍微调小一点；ok

流程业务梳理

## 流程列表(tabList)
### 新建
1. `srvsys_service_columnex_v2_select` 根据服务名查对应v2数据
  ```js
    {
      "serviceName":"srvsys_service_columnex_v2_select",
      "colNames":["*"],
      "condition":[
        {"colName":"service_name","value":"srvoa_issue_info_select","ruleType":"eq"},
        {"colName":"use_type","value":"proclist","ruleType":"eq"}
        ],
      "order":[{"colName":"seq","orderType":"asc"}]
    }
  ```
## 流畅详情
### 查看
1. `/oa/select/srvprocess_basic_cfg_select` 查找流程数据
   ```js
   <!-- 请求参数 -->
   {
     colNames: ["*"],
     condition: [
         {
           colName: "proc_instance_no", 
           ruleType: "eq", 
           value: "20200314164454639100" //流程编号
         }
       ],
     serviceName: "srvprocess_basic_cfg_select",
   }
   <!-- 响应数据 -->
   {
     mainData:{
       
     }
   }
   ```
2. 