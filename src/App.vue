<template>
  <v-app style="overflow: hidden">
    <v-system-bar
      v-if="process.platform != 'darwin'"
      app
      window
      style="-webkit-app-region: drag; -webkit-user-select: none"
      height="38"
      :class="{ 'elevation-3': $root.user }"
      :color="$root.user ? '#00695C' : 'transparent'"
      class="pr-0"
    >
      <v-fade-transition group leave-absolute>
        <div
          key="logo"
          v-if="!$root.notify.is"
          style="display: inline-flex !important; margin-left: 2px; z-index: 10"
        >
          <img
            src="./assets/logo.png"
            style="margin-right: 4px; margin-top: 3px; height: 18px"
          />
          <span style="margin-top: 2px" class="mr-2">Drawer</span>
        </div>
        <span
          key="notification"
          v-if="$root.notify.is"
          v-html="$root.notify.text"
        ></span>
      </v-fade-transition>

      <v-spacer></v-spacer>
      <div style="-webkit-app-region: no-drag; margin-bottom: 1px">
        <v-icon @click="minimize()" v-ripple class="toolbar-icon"
          >mdi-minus</v-icon
        >
        <v-icon
          @click="maximized ? unmaximize() : maximize()"
          v-ripple
          class="toolbar-icon"
          >mdi-crop-square</v-icon
        >
        <v-icon @click="close()" v-ripple class="toolbar-icon"
          >mdi-close</v-icon
        >
      </div>
    </v-system-bar>

    <v-system-bar
      v-if="process.platform == 'darwin'"
      app
      window
      style="-webkit-app-region: drag"
      height="38"
      :class="{ 'elevation-3': $root.user }"
      :color="$root.user ? '#00695C' : 'transparent'"
    >
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="close()"
        class="red lighten-1 mx-1"
      ></div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="minimize()"
        class="yellow darken-2 mx-1"
      ></div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="maximized ? unmaximize() : maximize()"
        class="green mx-1"
      ></div>
      <v-fade-transition group leave-absolute style="margin: 4px 4px 0px 10px">
        <div
          key="logo"
          v-if="!$root.notify.is"
          style="display: inline-flex !important"
        >
          <img
            src="./assets/logo.png"
            style="height: 24px; margin-right: 4px; margin-top: 1px"
          />
          <span style="margin-right: 4px; margin-top: 3px">Drawer</span>
        </div>
        <p
          key="notification"
          v-if="$root.notify.is"
          class="mb-1"
          v-html="$root.notify.text"
        ></p>
      </v-fade-transition>
    </v-system-bar>

    <v-main v-if="!$root.user" key="login">
      <div
        style="max-width: 28rem; padding-top: 5rem"
        class="mx-auto text-center"
      >
        <img style="height: 8rem; margin: auto" src="./assets/paradigm.png" />

        <v-card
          class="mt-10"
          color="#333333"
          style="border: none !important; width: 100%"
        >
          <v-card-title>
            <h1 class="text-h4 grey--text text--lighten-1">
              Sign in to your account
            </h1>
          </v-card-title>
          <v-card-text>
            <v-text-field
              hide-details
              label="Username"
              class="mb-3"
              v-model="username"
            ></v-text-field>
            <v-text-field
              hide-details
              label="Password"
              class="mb-6"
              type="password"
              @keypress.enter="signIn()"
              v-model="password"
            ></v-text-field>
            <v-checkbox label="Stay signed in" v-model="sticky"></v-checkbox>

            <v-btn
              elevation="2"
              block
              color="deep-purple darken-4"
              @click="signIn()"
              :disabled="!username || !password"
              >Sign in</v-btn
            >
          </v-card-text>

          <v-card-actions class="grey darken-4 pa-7">
            <p
              class="ma-auto subtitle-2 text-center font-weight-light text--grey text--darken-4"
            >
              Don't have an account?
              <a
                class="text--grey text--darken-4"
                @click="shell.openExternal('https://www.theparadigmdev.com')"
              >
                Create one online</a
              >
            </p>
          </v-card-actions>
        </v-card>
      </div>
    </v-main>

    <v-main v-else style="overflow: hidden">
      <v-container>
        <p>
          <span
            @click="cd(resolvePath(index))"
            style="cursor: pointer"
            class="subtitle-2 font-weight-regular grey--text"
            v-for="(item, index) in split_path"
            :key="index"
          >
            {{ item }} /</span
          >
        </p>

        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left" style="width: 56px"></th>
                <th class="text-left">Name</th>
                <th class="text-left" style="width: 200px">Type</th>
                <th class="text-left" style="width: 200px">Size</th>
                <th class="text-left" style="width: 200px">Modified</th>
              </tr>
            </thead>
            <tbody>
              <tr
                style="cursor: pointer"
                v-for="item in current"
                :key="item._id"
                @contextmenu="showActionMenu($event), (action_menu_item = item)"
                @click="!item.type ? cd(item.path) : downloadFile(item.path)"
              >
                <td style="width: 56px">
                  <v-icon v-if="!item.type">mdi-folder-open</v-icon>
                  <v-icon v-else-if="item.type.includes('image')"
                    >mdi-image</v-icon
                  >
                  <v-icon v-else-if="item.type.includes('video')"
                    >mdi-video</v-icon
                  >
                  <v-icon v-else-if="item.type.includes('audio')"
                    >mdi-music-note</v-icon
                  >
                  <v-icon v-else-if="item.type.includes('pdf')"
                    >mdi-file-pdf</v-icon
                  >
                  <v-icon v-else-if="item.type.includes('workshop')"
                    >mdi-file-cloud</v-icon
                  >
                  <v-icon v-else>mdi-file</v-icon>
                </td>
                <td>{{ item.name }}</td>
                <td style="width: 200px">
                  {{ !item.type ? "folder" : item.type }}
                </td>
                <td style="width: 200px">
                  {{ item.size == "0 B" ? "" : item.size }}
                </td>
                <td style="width: 200px">{{ item.modified }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>

        <p
          class="font-weight-light font-italic grey--text text-center mt-6"
          v-if="current.length < 1"
        >
          No files in this folder.
        </p>
      </v-container>

      <v-menu
        v-model="action_menu"
        :position-x="x"
        :position-y="y"
        absolute
        offset-y
      >
        <v-list dense>
          <v-list-item @click="deleteFile(action_menu_item.path)">
            <v-list-item-icon
              ><v-icon class="red--text">mdi-delete</v-icon></v-list-item-icon
            >
            <v-list-item-title class="red--text">Delete</v-list-item-title>
          </v-list-item>

          <v-list-item @click="startRename(action_menu_item)">
            <v-list-item-icon
              ><v-icon class="grey--text"
                >mdi-form-textbox</v-icon
              ></v-list-item-icon
            >
            <v-list-item-title class="grey--text">Rename</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-dialog
        v-model="rename.open"
        max-width="350"
        @click:outside="rename = { open: false }"
      >
        <v-card style="text-align: center">
          <v-card-title class="text-h5 font-weight-medium">RENAME</v-card-title>
          <v-card-text>
            <v-text-field
              hide-details="auto"
              class="mb-1"
              @keypress.enter="renameFile(rename._id)"
              v-model="rename.name"
              label="File name"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="uploader"
        max-width="350"
        @click:outside="(files = null), (uploader = false)"
      >
        <v-card style="text-align: center">
          <v-card-title class="text-h5 font-weight-medium"
            >UPLOAD FILE</v-card-title
          >

          <v-card-text>
            <v-file-input
              :disabled="uploading"
              style="max-width: 500px"
              color="teal darken-2"
              prepend-icon=""
              hide-details
              id="file"
              ref="file"
              v-model="files"
              multiple
              label="Upload..."
            ></v-file-input>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="grey darken-1"
              @click="(files = null), (uploader = false)"
              icon
              ><v-icon>mdi-close</v-icon></v-btn
            >
            <v-spacer></v-spacer>
            <v-btn text color="teal darken-2" @click="uploadFile()"
              >Upload</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-btn
        fab
        fixed
        bottom
        right
        color="teal darken-4"
        @click="uploader = true"
        ><v-icon>mdi-plus</v-icon></v-btn
      >
    </v-main>
  </v-app>
</template>

<script>
import { remote } from "electron";
import { io } from "socket.io-client";
import moment from "moment";
import { shell } from "electron";
import Store from "./store.js";
import chokidar from "chokidar";

const store = new Store();

export default {
  name: "App",
  data: () => ({
    win: remote.getCurrentWindow(),
    maximized: remote.getCurrentWindow().isMaximized(),
    process,
    username: "",
    password: "",
    sticky: true,

    headers: [
      { text: "", value: "icon", sortable: false, width: 24 },
      { text: "Name", value: "name" },
      { text: "Type", value: "type" },
      { text: "Size", value: "size" },
      { text: "Uploaded", value: "date", width: 200 },
      { text: "Actions", value: "action", sortable: false, width: 125 },
    ],
    files: null,
    rename: { open: false },
    link: "",
    uploader: false,
    uploadPercentage: 0,
    uploading: false,
    current: [],
    current_path: "/",
    current_id_path: "",

    action_menu_item: null,
    action_menu: false,
    x: 0,
    y: 0,

    window,
    shell,
    console,
  }),
  computed: {
    split_path() {
      let array = this.current_path.split("/");
      array.shift();
      array.shift();
      array.shift();
      array[0] = this.$root.user.username;
      // let paths = [
      //   {
      //     _id: this.$root.user._id,
      //     name: this.$root.user.username,
      //     files: this.$root.user.files,
      //   },
      // ];
      // let current = 0;
      // function search() {
      //   let item = paths[current].files.find(
      //     (file) => file.name == array[current + 1]
      //   );
      //   if (item) {
      //     paths.push(item);
      //     current++;
      //     search();
      //   }
      // }
      // search();
      // if (paths) return paths;
      return array;
    },
  },
  async created() {
    if (store.get("jwt")) {
      const jwt = store.get("jwt");
      this.$http
        .post("https://www.theparadigmdev.com/api/authentication/verify", {
          jwt,
        })
        .then(async (response) => {
          if (response.data.valid) {
            this.$root.user = response.data.user;
            const stats = await this.$http.get(
              `https://www.theparadigmdev.com/api/drawer/${
                this.$root.user._id
              }/${encodeURIComponent(`/mnt/drawer/${this.$root.user._id}`)}`
            );
            this.current = stats.data.files;
            this.$root.socket.emit("login", this.$root.user.username);
          }
        });

      chokidar.watch("/Users/aidanliddy/Desktop").on("all", (event, path) => {
        console.log(event, path);
      });
    }
  },
  methods: {
    close() {
      this.win.close();
    },
    maximize() {
      this.win.maximize();
      this.maximized = remote.getCurrentWindow().isMaximized();
    },
    unmaximize() {
      this.win.unmaximize();
      this.maximized = remote.getCurrentWindow().isMaximized();
    },
    minimize() {
      this.win.minimize();
    },

    signIn() {
      this.$http
        .post("https://www.theparadigmdev.com/api/authentication/signin", {
          username: this.username.toLowerCase(),
          password: this.password,
          sticky: this.sticky,
        })
        .then(async (response) => {
          if (!response.data.errors) {
            this.$root.user = response.data.user;
            this.username = "";
            this.password = "";
            store.set("jwt", response.data.jwt);
            this.$root.socket.emit("login", this.$root.user.username);
          } else {
            this.$notify(`<span class="red--text">${response.data.msg}</span>`);
          }
        })
        .catch((error) => console.error(JSON.stringify(error)));
    },
    signOut() {
      if (this.$root.user) {
        this.$http
          .post("https://www.theparadigmdev.com/api/authentication/signout", {
            _id: this.$root.user._id,
          })
          .then((response) => {
            this.$root.socket.disconnect();
            this.$root.socket = io.connect("https://www.theparadigmdev.com");
            store.set("jwt", false);
            this.$root.user = false;
          });
      }
    },

    showActionMenu(e) {
      e.preventDefault();
      this.action_menu = false;
      this.x = e.clientX;
      this.y = e.clientY;
      this.$nextTick(() => {
        this.action_menu = true;
      });
    },

    async cd(target) {
      console.log(target);
      const data = await this.$http.get(
        `https://www.theparadigmdev.com/api/drawer/${
          this.$root.user._id
        }/${encodeURIComponent(target)}`
      );
      console.log(data.data.files);

      if (target == this.$root.username) {
        this.current = data.data.files;
        this.current_path = "/";
      } else {
        this.current = data.data.files;
        this.current_path = target;
      }
    },
    resolvePath(index) {
      console.log(index);
      let path = `/mnt/drawer/${this.$root.user._id}`;
      for (let i = 1; i <= index; i++) {
        path += `/${this.split_path[i]}`;
      }
      console.log(path);
      return path;
    },
    uploadFile() {
      this.uploading = true;
      let formData = new FormData();
      for (var i = 0; i < this.files.length; i++) {
        let file = this.files[i];
        formData.append(i, file);
      }
      this.$http
        .post(
          `https://www.theparadigmdev.com/api/drawer/${
            this.$root.user._id
          }/upload/${
            this.current_id_path === ""
              ? encodeURIComponent("/")
              : encodeURIComponent(this.current_id_path)
          }`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              this.uploadPercentage = parseInt(
                Math.round((progressEvent.loaded / progressEvent.total) * 100)
              );
            },
            timeout: 0,
          }
        )
        .then((response) => {
          this.$root.user = response.data;
          this.current = response.data.files;
          this.files = null;
          this.uploading = false;
        })
        .catch((error) => {
          console.log("Upload: failed", error);
          this.files = null;
          this.uploading = false;
        });
    },
    downloadFile(path) {
      window.open(
        `https://www.theparadigmdev.com/api/drawer/${
          this.$root.user._id
        }/download/${encodeURIComponent(path)}`
      );
    },
    deleteFile(path) {
      console.log(path);
      this.$http
        .delete(
          `https://www.theparadigmdev.com/api/drawer/${
            this.$root.user._id
          }/${encodeURIComponent(path)}`
        )
        .then((response) => {
          this.current = response.data.files;
        })
        .catch((error) => {
          console.error("Delete: error", error);
        });
    },
    startRename(item) {
      this.rename = JSON.parse(JSON.stringify(item));
      this.rename.open = true;
    },
    renameFile() {
      this.$http
        .post(
          `https://www.theparadigmdev.com/api/drawer/${this.$root.user._id}/rename`,
          {
            old: this.rename.path,
            new:
              this.rename.path.substring(
                0,
                this.rename.path.lastIndexOf("/") + 1
              ) + this.rename.name,
          }
        )
        .then((response) => {
          this.rename = { open: false };
          this.current = response.data.files;
        });
    },
    getLink(path) {
      this.link = `https://www.theparadigmdev.com/api/drawer/${this.$root.user._id}/get/${path}`;
    },
  },
};
</script>

<style>
html {
  overflow: hidden !important;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: rgb(33, 33, 33);
}
::-webkit-scrollbar-thumb {
  background: rgb(100, 100, 100);
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(60, 60, 60);
}
::-webkit-scrollbar-corner {
  background: rgb(33, 33, 33);
}
</style>