import {debounce} from "./utils";

export const itemListenerMixin = {
  data(){
    return {
      ItemImgListener:null
    }
  },
  mounted() {
    let refresh = debounce(this.$refs.scroll.refresh, 500)

    this.ItemImgListener = () => {
      refresh()
    }

    this.$bus.$on("itemImageLoad", this.ItemImgListener)
    // console.log('我是混入的内容');
  }
  }
