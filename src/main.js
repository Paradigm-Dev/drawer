import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import io from "socket.io-client";
import Store from "./store";

let socket = io.connect("https://www.theparadigmdev.com");
const store = new Store();
Vue.config.productionTip = false;
Vue.prototype.$http = axios;

Vue.mixin({
  methods: {
    $getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    $notify(text) {
      this.$root.notify.text = text;
      this.$root.notify.is = true;
      setTimeout(() => {
        this.$root.notify.text = "";
        this.$root.notify.is = false;
      }, 3000);
    },
    $urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
    async $subscribe() {
      const existsing_subscription = this.$root.user.notifications.find(
        subscription => subscription._id == store.get("notification_id")
      );
      console.log(existsing_subscription);
      if (
        ((await this.$root.worker.pushManager.permissionState()) != "granted" &&
          !existsing_subscription) ||
        ((await this.$root.worker.pushManager.permissionState()) == "granted" &&
          !existsing_subscription)
      ) {
        navigator.serviceWorker.ready.then(async serviceWorkerRegistration => {
          console.log("Registering Push...");
          serviceWorkerRegistration.pushManager
            .subscribe({
              applicationServerKey: this.$urlBase64ToUint8Array(
                this.$root.public_vapid_key
              ),
              userVisibleOnly: true
            })
            .then(subscription => {
              console.log("Push Registered...");
              console.log("Sending Push...");
              this.$http
                .post(
                  `https://www.theparadigmdev.com/api/notifications/${this.$root.user._id}/subscribe`,
                  {
                    data: subscription
                  }
                )
                .then(response => {
                  console.log("Push Sent...");
                  console.log(response.data._id);
                  store.set("notification_id", response.data._id);
                })
                .catch(error => console.error(error));
            });
        });
      }
    }
  }
});

new Vue({
  vuetify,
  render: h => h(App),
  data() {
    return {
      notify: {
        is: false,
        text: ""
      },
      user: false,
      socket,
      worker: null,
      public_vapid_key:
        "BANy_l888yNEj3sW1ASQBEc3dKBq4MnOn9uu4x_gZteD8SNUYwUFbOPrFdGMiFS0zI16bie6vA-P6bNBXMXhAvc"
    };
  },
  created() {
    // Check for service worker
    if ("serviceWorker" in navigator) {
      registerServiceWorker().catch(err => console.error(err));
    }

    let that = this;
    // Register SW, Register Push, Send Push
    async function registerServiceWorker() {
      // Register Service Worker
      console.log("Registering service worker...");
      that.$root.worker = await navigator.serviceWorker.register(
        // `${process.env.BASE_URL}worker.js`,
        `/worker.js`,
        {
          scope: "/"
        }
      );
      console.log("Service Worker Registered...");
    }
  }
}).$mount("#app");
