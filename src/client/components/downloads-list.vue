<template>
  <div>
    <transition-group name="list">
      <div v-for="download in cDownloads" class="download"
           :key="download.id"
           :class="{finished: download.status === 'finished'}">
        <div class="download-side-icons">
          <a class="download-icon" :href="download.downloadUrl">
            <span class="fa-stack fa">
              <i class="fa fa-circle fa-stack-2x"></i>
              <i class="fa fa-cloud-download fa-stack-1x fa-inverse"></i>
            </span>
          </a>
          <v-progress-circular v-if="deleted[download.id]" indeterminate v-bind:width="3" :size="25" class="spinner"></v-progress-circular>
          <a v-else class="delete-icon" href="#" @click.prevent="deleteDownload(download.id)">
            <i class="fa fa-trash fa-lg"></i>
          </a>
        </div>
        <a class="download-link" :href="download.shareUrl" :title="download.url" v-text="download.filename"></a>
        <div class="progress">
          <v-progress-linear v-model="download.progress" :indeterminate="download.progress === null"></v-progress-linear>
        </div>
        <div class="text-xs-center" v-text="download.progressText"></div>
      </div>
    </transition-group>
  </div>
</template>

<script>
  import { socket } from '../plugins/socket.io.js';
  import axios from '../plugins/axios';
  import { mapMutations } from 'vuex';

  export default {
    name: 'downloads-list',
    props: ['downloads'],
    data () {
      return {
        myDownloads: this.downloads,
        deleted: {}
      };
    },
    beforeMount () {
      socket
      .on('reconnect', async () => {
        console.log('reconnected');
        try {
          let {data: downloads} = await axios.get(`/downloads`);
          this.myDownloads = downloads;
        } catch (error) {
          this.$store.commit('notification/FAILURE', { message: 'Downloads fetch failed' });
        }
      })
      .on('progress', (downloadId, downloaded, downloadSize) => {
        const download = this.myDownloads.find(download => download.id === downloadId);
        if (download) {
          download.downloaded = downloaded;
          download.downloadSize = downloadSize;
        }
      })
      .on('download', updatedDownload => {
        const foundDownload = this.myDownloads.find(download => download.id === updatedDownload.id);
        if (foundDownload) {
          Object.assign(foundDownload, updatedDownload);
        } else {
          this.myDownloads.push(updatedDownload);
        }
      })
      .on('delete', deletedId => {
        const index = this.myDownloads.findIndex(download => download.id === deletedId);
        if (index >= 0) {
          this.myDownloads.splice(index, 1);
        }
      });
    },
    beforeDestroy () {
      socket.off('reconnect').off('progress').off('download').off('delete');
    },
    computed: {
      cDownloads () {
        const getDownloadUrl = shareUrl => shareUrl.replace(/\/$/, '').replace('//meocloud.pt/link/', '//cld.pt/dl/download/') + '?download=true';
        const getPercentage = download => (Math.floor(download.downloaded / download.downloadSize * 10000) / 100);

        const getProgress = download => {
          if (download.status === 'error') return { progress: 100, progressText: 'Failed' };
          else if (download.status === 'finished') return { progress: 100, progressText: '100 %' };
          else if (download.downloadSize) {
            const progress = getPercentage(download);
            return { progress, progressText: `${progress} %` };
          } else if (download.downloaded) return { progress: null, progressText: 'N/A' };
          else return { progress: 0, progressText: '0 %' };
        };

        return this.myDownloads.map(download => {
          return {
            ...download,
            downloadUrl: download.shareUrl ? getDownloadUrl(download.shareUrl) : null,
            ...getProgress(download)
          };
        });
      }
    },
    methods: {
      ...mapMutations({
        notifyError: 'notification/FAILURE'
      }),
      async deleteDownload (id) {
        if (this.deleted[id]) return;
        this.$set(this.deleted, id, true);
        console.log(`Delete ${id}`);
        try {
          await axios.delete(`/downloads/${id}`);
          this.myDownloads = this.myDownloads.filter(d => d.id !== id);
        } catch (error) {
          this.notifyError({ message: 'It was not possible to delete this download.' });
          this.$delete(this.deleted, id);
        }
      }
    }
  };
</script>

<style scoped lang="stylus">

  .download {
    &:not(.finished) .download-icon {
      color: gray;
    }
  }
  .download {
    &:before {
      content: ' ';
      height: 10px;
      display: block;
    }
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
  .progress-linear {
    margin: 14px 0 5px;
  }
  .delete-icon {
    margin-left: 10px;
    .fa {
      font-size: 1.75em;
    }
  }

  .download-side-icons {
    float: right;
  }

  .download-link {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100% - 60px);
    display: block;
    margin: 0;
  }

  .spinner {
    font-size: 1.5em
    margin-left: 4.2px;
    vertical-align: middle;
    color: #007bf6;
  }

  .download {
    height: 80px;
    overflow: hidden;
    width: 100%;
  }
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  .list-enter, .list-leave-to {
    height: 0;
    opacity: 0;
  }
</style>
