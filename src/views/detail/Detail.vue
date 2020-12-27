<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
    <scroll class="content" ref="scroll" :probe-type="3" @scroll="contentScroll">
      <ul>
        <li v-for="item in $store.state.carList">
          {{item}}
        </li>
      </ul>
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-param-info ref="params" :param-info="paramInfo"/>
      <detail-comment-info ref="comment" :comment-info="commentInfo"/>
      <goods-list ref="recommend" :goods="recommends"/>
    </scroll>
    <detail-bottom-bar @addCart="addToCart"/>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>
  </div>
</template>

<script>
  import DetailNavBar from "./childComps/DetailNavBar";
  import DetailSwiper from "./childComps/DetailSwiper";
  import DetailBaseInfo from "./childComps/DetailBaseInfo";
  import DetailShopInfo from "./childComps/DetailShopInfo";
  import Scroll from "components/common/scroll/Scroll";
  import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
  import DetailParamInfo from "./childComps/DetailParamInfo";
  import DetailCommentInfo from "./childComps/DetailCommentInfo";
  import GoodsList from "components/content/goods/GoodsList";
  import DetailBottomBar from "./childComps/DetailBottomBar";
  import BackTop from "components/content/backTop/BackTop";
  import {debounce} from "common/utils";
  import {itemListenerMixin} from "common/mixin";

  import {getDetail,Goods,Shop,GoodsParam,getRecommend} from "network/detail";

  import {mapActions} from 'vuex'
  export default {
    name: "Detail",
    components:{
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      Scroll,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      GoodsList,
      DetailBottomBar,
      BackTop
    },
    mixins:[itemListenerMixin],
    data(){
      return {
        iid:null,
        topImages:[],
        goods : {},
        shop:{},
        detailInfo:{},
        paramInfo:{},
        commentInfo:{},
        recommends:[],
        themeTopYs:[],
        getThemeTopY:null,
        currentIndex:0,
        isShowBackTop: false,
      }
    },
    created(){
      // console.log(this.$route.params.iid);
      //1，保存传入的
      this.iid = this.$route.params.iid
    //  2，根据iid请求详细数据
      getDetail(this.iid).then(res =>{
         // console.log(res);
         const data = res.result;
        //1,获取顶部的图片轮播数据
        this.topImages = data.itemInfo.topImages
        //2,获取商品信息
        this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)
        //3,创建店铺信息的对象
        this.shop = new Shop(data.shopInfo)
        //4,保存商品的详情数据
        this.detailInfo = data.detailInfo;
        //5,获取参数信息
        this.paramInfo = new GoodsParam(data.itemParams.info,data.itemParams.rule)
        //6,取出品论信息
        if (data.rate.cRate !==0){
          this.commentInfo = data.rate.list[0]
        }
        this.$nextTick(()=>{
          //根据最新的数据，对应的DOM是已经被渲染出来
          //但是图片依然是没有加载完（目前获取到的offsetTop不包含其中的图片）
          // this.themeTopYs = []
          // this.themeTopYs.push(0);
          // this.themeTopYs.push(this.$refs.params.$el.offsetTop-44);
          // this.themeTopYs.push(this.$refs.comment.$el.offsetTop-44);
          // this.themeTopYs.push(this.$refs.recommend.$el.offsetTop-44);
          // console.log(this.themeTopYs);
        })
      })

      //3,请求推荐数据
      getRecommend().then(res =>{
        this.recommends = res.data.list
      })

      //4,给个体ThemeTopY赋值
      this.getThemeTopY = debounce(() =>{
        this.themeTopYs = []
        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.params.$el.offsetTop-44);
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop-44);
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop-44);
        this.themeTopYs.push(Number.MAX_VALUE);
        // console.log(this.themeTopYs);
      },100)
    },
    mounted() {
      // console.log('mounted');
    },
    updated() {
    },
    destroyed() {
      this.$bus.$off("itemImageLoad",this.ItemImgListener)

    },
    methods:{
      ...mapActions(['addCart']),
      imageLoad(){
        this.$refs.scroll.refresh()
        this.getThemeTopY()
      },
      titleClick(index){
        // console.log(index);
        this.$refs.scroll.scrollTo(0,-this.themeTopYs[index],200)
      },
      contentScroll(position){
        // console.log(position);
        //1,获取y值
        const positionY = -position.y

        let length = this.themeTopYs.length
        //2,positionY和主题中的值进行对比
        for (let i = 0; i<length - 1; i++){
          if (this.currentIndex!==i && (positionY >= this.themeTopYs[i] && positionY<this.themeTopYs[i+1])){
            this.currentIndex = i
            this.$refs.nav.currentIndex = this.currentIndex
          }
        }
        //3是否显示回到顶部
        this.isShowBackTop = (-position.y) >1000
      },
      backClick(){
        this.$refs.scroll.scrollTo(0,0,500)
      },
      addToCart(){
        //1,获取购物车需要展示信息
        const product = {}
        product.image = this.topImages[0];
        product.title = this.goods.title;
        product.desc = this.goods.desc;
        product.price = this.goods.realPrice;
        product.iid = this.iid;
        product.count = 0

        //2,将商品添加到购物车
        // this.$store.commit('addCart',product)
        //这是一种方法
        // this.$store.dispatch('addCart',product).then(res =>{
        //   console.log(res);
        // })
        this.addCart(product).then(res =>{
          this.$toast.show(res,2000)
          // console.log(res);
        })
      }
    }
  }
</script>

<style scoped>
  #detail{
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }
  .detail-nav{
    position: relative;
    z-index: 9;
    background-color: #fff;
  }
  .content{
    height: calc(100% - 44px - 49px);
    overflow: hidden;
  }
</style>
