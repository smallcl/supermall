<template>
  <div class="bottom-bar">
  <div class="chenk-content">
    <check-button @click.native="checkClick"
      class="check-button" :is-checked="isSelectAll"/>
    <span>全选</span>
  </div>
    <div class="price">
      合计: {{totalPrice}}
    </div>
    <div class="calcuate" @click="calcClick">
      去计算({{checkLength}})
    </div>
  </div>
</template>

<script>
  import CheckButton from "components/content/checkButton/CheckButton";
  import {mapGetters} from 'vuex'
  export default {
    name: "CartBottomBar",
    components:{
      CheckButton
    },
    computed:{
      ...mapGetters(['cartList']),
      totalPrice(){
        return '￥'+ this.cartList.filter(item => {
          return item.checked
        }).reduce((preValue,item) =>{
          return preValue+ item.price * item.count
        },0).toFixed(2)
      },
      checkLength(){
        return this.cartList.filter(item => item.checked).length
      },
      isSelectAll(){
        if (this.cartList.length === 0) return false
        // return !(this.cartList.filter(item => !item.checked).length)
        return !this.cartList.find(item => !item.checked)
      }
    },
    methods:{
      checkClick(){
        if (this.isSelectAll){  //全部选中的
          this.cartList.forEach(item => item.checked = false)
        }else{ //部分或全部不选中
          this.cartList.forEach(item => item.checked = true)
        }
        //这里不能简化
        // this.cartList.forEach(item => item.checked = !this.isSelectAll)
      },
      calcClick(){
        if (!this.checkLength){
          this.$toast.show('请选择购买的商品',2000)
        }
      }
    }
  }
</script>

<style scoped>
  .bottom-bar{
    height: 40px;
    background-color: #eee;
    position: relative;
    line-height: 40px;
    display: flex;
    font-size: 14px;
  }
  .chenk-content{
    display: flex;
    align-items: center;
    margin-left: 10px;
    width: 60px;
  }
  .check-button{
    width: 20px;
    height: 20px;
    line-height: 20px;
    margin-right: 5px;

  }
  .price{
    margin-left: 20px;
    flex: 1;
  }
  .calcuate{
    width: 90px;
    background-color: red;
    color: #fff;
    text-align: center;
  }
</style>
