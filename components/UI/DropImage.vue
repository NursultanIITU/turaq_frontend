<script>
export default {
  name: "VueUploadImages", // vue component name
  data() {
    return {
      error: "",
      files: [],
      dropped: 0,
      Imgs: [],
    };
  },
  props: {
    max: Number,
    uploadMsg: String,
    maxError: String,
    fileError: String,
    clearAll: String,
    oldImages: Array
  },
  methods: {
    dragOver() {
      this.dropped = 2;
    },
    dragLeave() {},
    drop(e) {
      let status = true;
      let files = Array.from(e.dataTransfer.files)
      if (e && files) {
        files.forEach((file) => {
          if (file.type.startsWith("image") === false) status = false;
        });
        if (status == true) {
          if (
            this.$props.max &&
            files.length + this.files.length > this.$props.max
          ) {
            this.error = this.$props.maxError
              ? this.$props.maxError
              : `Maximum files is` + this.$props.max;
          } else {
            this.files.push(...files);
            this.previewImgs();
          }
        } else {
          this.error = this.$props.fileError
            ? this.$props.fileError
            : `Unsupported file type`;
        }
      }
      this.dropped = 0;
    },
    append() {
      this.$refs.uploadInput.click();
    },
    dataURLtoBlob(dataurl) {
      let arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);

      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new Blob([u8arr], {type:mime});
    },
    readAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 800;
            canvas.height = (img.height / img.width) * 800;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const newDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(newDataUrl);
          };
        };
        reader.onerror = error => reject(error);
      });
    },
    deleteImg(index) {
      this.Imgs.splice(index, 1);
      this.files.splice(index, 1);
      this.$emit("changed", this.files);
      this.$refs.uploadInput.value = null;
    },
    previewImgs(event) {
      if (!event || !event.target || !event.target.files || event.target.files.length === 0) {
        this.error = 'No files selected.';
        return;
      }

      if (this.$props.max && event.target.files.length + this.files.length > this.$props.max) {
        this.error = this.$props.maxError ? this.$props.maxError : `Maximum files is ${this.$props.max}`;
        return;
      }

      let readers = [];
      for (let file of event.target.files) {
        readers.push(this.readAsDataURL(file));
      }

      Promise.all(readers).then(compressedImagesDataUrls => {
        const compressedFiles = compressedImagesDataUrls.map((dataUrl, index) => {
          const blob = this.dataURLtoBlob(dataUrl);
          return new File([blob], event.target.files[index].name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
        });

        this.files = [...this.files, ...compressedFiles];
        this.$emit('changed', this.files);

        this.Imgs = [...this.Imgs, ...compressedImagesDataUrls];
      }).catch(error => {
        this.error = `Error processing files: ${error.message}`;
      });
    },
    reset() {
      this.$refs.uploadInput.value = null;
      this.Imgs = [];
      this.files = [];
      this.$emit("changed", this.files);
    },
  },
};
</script>

<template>
<div>
  <div
    class="container"
    @dragover.prevent="dragOver"
    @dragleave.prevent="dragLeave"
    @drop.prevent="drop($event)"
  >
    <div class="drop" v-show="dropped == 2"></div>
    <!-- Error Message -->
    <div v-show="error" class="error">
      {{ error }}
    </div>


    <div class="imgsPreview mb-3" v-if="oldImages?.length">
      <div class="imageHolder" v-for="(img, i) in oldImages" :key="i">
        <img :src="img" />
      </div>
    </div>

    <!-- To inform user how to upload image -->
    <div v-show="Imgs.length == 0" class="beforeUpload">
      <input
        type="file"
        style="z-index: 1"
        accept="image/*"
        ref="uploadInput"
        @change="previewImgs"
        multiple
      />
      <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="1.13965" width="23" height="23" rx="3.5" stroke="#256AF2"/>
        <path d="M12.0001 7.30664C12.3683 7.30664 12.6667 7.60512 12.6667 7.97331V11.9733H16.6667C17.0349 11.9733 17.3334 12.2718 17.3334 12.64C17.3334 13.0082 17.0349 13.3066 16.6667 13.3066H12.6667V17.3066C12.6667 17.6748 12.3683 17.9733 12.0001 17.9733C11.6319 17.9733 11.3334 17.6748 11.3334 17.3066V13.3066H7.33341C6.96522 13.3066 6.66675 13.0082 6.66675 12.64C6.66675 12.2718 6.96522 11.9733 7.33341 11.9733H11.3334V7.97331C11.3334 7.60512 11.6319 7.30664 12.0001 7.30664Z" fill="#256AF2"/>
      </svg>


      <p class="mainMessage">
        {{ uploadMsg ? uploadMsg : "Click to upload or drop your images here" }}
      </p>
    </div>
  </div>
  <div class="imgsPreview" v-show="Imgs.length > 0">
      <!-- <button type="button" class="clearButton" @click="reset">
        {{ clearAll ? clearAll : "clear All" }}
      </button> -->
      <div class="imageHolder" v-for="(img, i) in Imgs" :key="i">
        <img :src="img" />
        <span class="delete" style="color: white" @click="deleteImg(--i)">
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </span>
      </div>
      <div class="plus" @click="append" v-if="Imgs.length < max">
            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="1.13965" width="23" height="23" rx="3.5" stroke="#256AF2"/>
                <path d="M12.0001 7.30664C12.3683 7.30664 12.6667 7.60512 12.6667 7.97331V11.9733H16.6667C17.0349 11.9733 17.3334 12.2718 17.3334 12.64C17.3334 13.0082 17.0349 13.3066 16.6667 13.3066H12.6667V17.3066C12.6667 17.6748 12.3683 17.9733 12.0001 17.9733C11.6319 17.9733 11.3334 17.6748 11.3334 17.3066V13.3066H7.33341C6.96522 13.3066 6.66675 13.0082 6.66675 12.64C6.66675 12.2718 6.96522 11.9733 7.33341 11.9733H11.3334V7.97331C11.3334 7.60512 11.6319 7.30664 12.0001 7.30664Z" fill="#256AF2"/>
            </svg>
            <p class="mainMessage">
                {{ uploadMsg ? uploadMsg : "Click to upload or drop your images here" }}
            </p></div>
    </div>
    </div>
</template>

<style scoped>
.container {
  
}
.mainMessage {
    color: #256AF2;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
}
.drop {
  width: 100%;
  height: 100%;
  top: 0;
  border-radius: 10px;
  position: absolute;
  background-color: #f4f6ff;
  left: 0;
  border: 3px dashed #a3a8b1;
}
.error {
  text-align: left;
  color: red;
  font-size: 15px;
  margin-bottom: 4px;
}
.beforeUpload {
  position: relative;
  text-align: center;
  width: 100%;
  height: 146px;
  background: #fff;
  border: 1px dashed #B2B2B2;
  border-radius: 16px;
  padding: 30px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
}
.beforeUpload input {
  width: 100%;
  margin: auto;
  height: 100%;
  opacity: 0;
  position: absolute;
  background: red;
  display: block;
}
.beforeUpload input:hover {
  cursor: pointer;
}
.beforeUpload .icon {
  width: 150px;
  margin: auto;
  display: block;
}
.imgsPreview {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}
.imgsPreview .imageHolder {
  width: 159px;
  height: 149px;
  background: #fff;
  position: relative;
  border-radius: 10px;
  /* margin: 5px 5px; */
  display: inline-block;
}
.imgsPreview .imageHolder img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-radius: 16px;
}
.imgsPreview .imageHolder .delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 29px;
  height: 29px;
  color: #fff;
  background: red;
  border-radius: 50%;
}
.imgsPreview .imageHolder .delete:hover {
  cursor: pointer;
}
.imgsPreview .imageHolder .delete .icon {
  width: 66%;
  height: 66%;
  display: block;
  margin: 4px auto;
}
.plus {
  text-align: center;
  /* position: absolute; */
  /* left: 179px; */
  /* bottom: 0; */
  width: 159px;
    height: 149px;
    background: #fff;
    border: 1px dashed #B2B2B2;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
}
.plus:hover {
  cursor: pointer;
}
.clearButton {
  color: #2d3748;
  position: absolute;
  top: 7px;
  right: 7px;
  background: none;
  border: none;
  cursor: pointer;
}
</style>