<template>
  <div class="iframe-container">
    <iframe
      src="http://120.26.210.135:18080"
      class="full-screen-iframe"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.iframe-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.full-screen-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
