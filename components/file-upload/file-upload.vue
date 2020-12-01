<template>
  <view class="file-upload">
    <view ref="input" class="input"></view>
    <view class="addNew" @click="chooseFile" v-if="fileResList.length<1"><text class="cuIcon-add"></text></view>
    <view class=""><text ref="fileTip" id="fileTip"></text></view>
    <view class="file-list">
      <view class="file-list-item" v-for="(item,index) in fileResList" :key="index">
        <view class="file-info" v-if="item.src_name">
          {{item.src_name}}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ajax from '@/common/ajax.js';
import Emitter from '@/common/mixins/emitter.js';
export default {
  data() {
    return {
      fileList: [],
      fileInfo:{},
      fileResList:[]
    };
  },
  props: {
    srvInfo: {
      type: Object,
      default: () => {}
    }
  },
  mixins: [Emitter],
  methods: {
    chooseFile() {
      const self = this;
      let fileTip = document.getElementById('fileTip');
      var input = document.createElement('input');
      input.style = 'display:none';
      input.type = 'file';
      input.onchange = event => {
        self.fileChange(event);

        // const files = event.target.files
        // if (files && files[0]) {
        //   const file = files[0];
        //   if (file.size > 1024 * 1024 * 10) {
        //     fileTip.innerHTML = '文件大小不能超过10M!';
        //     input.value = '';
        //     return false;
        //   } else {
        //     fileTip.innerHTML = '';
        //     console.log(file)
        //     formData.append('file', file);
        //   }
        // }
      };
      input.click();
      // this.$refs.input.$el.appendChild(input);
    },
    fileChange(event) {
      const self = this;
      let formData = new FormData();
      const files = event.target.files;
      if (files && files[0]) {
        const file = files[0];
        self.fileList.push(file);
        if (file.size > 1024 * 1024 * 10) {
          fileTip.innerHTML = '文件大小不能超过10M!';
          input.value = '';
          return false;
        } else {
          fileTip.innerHTML = '';
          // formData.append('file', file);
          // formData.append('bx_auth_ticket', uni.getStorageSync('bx_auth_ticket'));
          // formData.append('serviceName', 'srv_bxfile_service');
          // formData.append('interfaceName', 'add');
          // formData.append('app_no', uni.getStorageSync('activeApp'));
          ajax({
            headers: {
              bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
            },
            withCredentials: false,
            file: file,
            data: {
              bx_auth_ticket: uni.getStorageSync('bx_auth_ticket'),
              serviceName: 'srv_bxfile_service',
              interfaceName: 'add',
              app_no: uni.getStorageSync('activeApp')
            },
            filename: 'file',
            action: self.$api.upload,
            onProgress: e => {
              // self.handleProgress(e, file);
            },
            onSuccess: res => {
              self.handleSuccess(res, file);
            },
            onError: (err, response) => {
              // self.handleError(err, response, file);
            }
          });
          // var xhr = new XMLHttpRequest();
          // xhr.open('POST', self.$api.upload, true);
          // xhr.setRequestHeader('bx_auth_ticket', uni.getStorageSync('bx_auth_ticket'));
          // xhr.onreadystatechange = function() {
          //   console.log(xhr.responseText)
          //   if (xhr.readyState == 4) {
          //     if (xhr.status == 200 || xhr.status == 304) {
          //       console.log(xhr.responseText)
          //       return xhr.responseText
          //     }
          //   }
          // };
          // xhr.send(formData);
          // return xhr
        }
      }
    },
    getFile(file) {
      const fileList = this.fileList;
      let target;
      fileList.every(item => {
        target = file.uid === item.uid ? item : null;
        return !target;
      });
      return target;
    },
    handleProgress(e, file) {
      const _file = this.getFile(file);
      this.onProgress(e, _file, this.fileList);
      _file.percentage = e.percent || 0;
    },
    handleSuccess(res, file) {
      const _file = this.getFile(file);
      // this.fileList.push(_file)
      if (_file) {
        _file.status = 'finished';
        _file.response = res;
        // this.fileResList.push(res)
        this.$set(this.fileResList,0,res)
        this.fileInfo = res
        this.$emit('add',_file)
        // this.onSuccess(res, _file, this.fileList);
        // this.dispatch('FormItem', 'on-form-change', _file);
        // setTimeout(() => {
        //   _file.showProgress = false;
        // }, 1000);
      }
    },
    handleError(err, response, file) {
      const _file = this.getFile(file);
      const fileList = this.fileList;
      _file.status = 'fail';
      fileList.splice(fileList.indexOf(_file), 1);
      this.onError(err, response, file);
    },
    handleRemove(file) {
      const fileList = this.fileList;
      fileList.splice(fileList.indexOf(file), 1);
      this.onRemove(file, fileList);
    },
    handlePreview(file) {
      if (file.status === 'finished') {
        this.onPreview(file);
      }
    }
  }
};
</script>

<style scoped lang="scss">
.file-upload {
  .addNew {
    width: 125upx;
    height: 150upx;
    border: 1px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20upx;
    margin-right: 12rpx;
  }
}
</style>
