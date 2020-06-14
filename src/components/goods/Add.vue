<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <!-- 提示区域 -->
    <el-card>
      <el-alert title="消息提示的文案" type="info" show-icon center :closable="false"></el-alert>
      <!-- 进度条 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品类容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="AddForm"
        :rules="AddFormRules"
        ref="addRuleForm"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="AddForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="AddForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="AddForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="AddForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="AddForm.goods_cat"
                :options="catelist"
                :props="addProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTabData" :key="item.attr_id" :label="item.attr_name">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTabData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传的后台api地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="AddForm.goods_introduce"></quill-editor>
              <!-- 添加商品按钮 -->
              <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previwImg">
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      activeIndex: "0",
      //   表单数据
      AddForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        //长传的数组
        pics: [],
        //商品详情描述
        goods_introduce:'',
        attrs:[]
      },
      catelist: [],
      AddFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品数量", trigger: "blur" }
        ]
      },
      addProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 动态参数列表数据
      manyTabData: [],
      //静态属性
      onlyTabData: [],
      //   上传图片的URL地址
      uploadURL: "http://timemeetyou.com:8889/api/private/v1/upload",
      // 上传图片组件的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      previewPath: "",
      //图片预览开关
      previewVisible:false
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        this.$message.error("获取分类列表失败!");
      }
      this.$message.success("获取分类列表成功");
      this.catelist = res.data;
      console.log(this.catelist);
    },
    //级联选择器变动
    handleChange() {
      console.log(this.AddForm.goods_cat);
      if (this.AddForm.goods_cat.length !== 3) {
        this.AddForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('进入'+activeName);
      // console.log('离开'+oldActiveName);
      if (oldActiveName === "0" && this.AddForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类!");
        return false;
      }
    },
    async tabClicked() {
      // console.log(this.activeIndex)
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品参数失败!");
        }
        this.$message.success("获取商品参数成功");
        console.log(res);
        // 将data中的attr_vals分割成数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        this.manyTabData = res.data;
        console.log(this.manyTabData);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品属性失败!");
        }
        this.$message.success("获取商品属性成功");
        console.log(res);
        this.onlyTabData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible=true
    },
    // 处理移除图片操作
    handleRemove(file) {
      //1.获取将要删除的临时路径
      console.log(file);

      const filePath = file.response.data.tmp_path;
      // 2.从pics数组中,找到这个图片对应的索引值
      const i = this.AddForm.pics.findIndex(x => x.pic === filePath);
      // 3.调用数组的splice方法,把图片信息对象,从pics数组中移除
      this.AddForm.pics.splice(i, 1);
      console.log(this.AddForm);
    },
    // 监听图片上传成功
    handleSuccess(response) {
      console.log(response);
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2.将图片信息对象，push到pics数组中去
      this.AddForm.pics.push(picInfo);
      console.log(this.AddForm);
    },
    add(){
        this.$refs.addRuleForm.validate (async valid=>{
          if(!valid) {
            this.$message.error('请填写必要的表单项')
          }
          //执行添加
           const form=this.deepClone(this.AddForm)
          form.goods_cat=form.goods_cat.join(',')
          console.log(form);
          //处理动态参数
          this.manyTabData.forEach(item=>{
            const newInfo={
              attr_id:item.attr_id,
              attr_value:item.attr_vals.join(',')
            }
            this.AddForm.attrs.push(newInfo)
          })
          //处理静态属性
           this.onlyTabData.forEach(item=>{
            const newInfo={
              attr_id:item.attr_id,
              attr_value:item.attr_vals
            }
            this.AddForm.attrs.push(newInfo)
          })
          form.attrs=this.AddForm.attrs
          console.log(form);
          //发起请求,添加商品
          //商品名称,必须是唯一的
          const {data:res} =await this.$http.post('goods',form)
          if (res.meta.status!==201) {
            this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功!')
          this.$router.push('/goods')
        })
        
    },
    //深拷贝对象
    deepClone(obj){
    let newObj = JSON.stringify(obj);
    let objClone = JSON.parse(newObj);
    return objClone;  
}
  },
  computed: {
    cateId() {
      if (this.AddForm.goods_cat.length === 3) {
        return this.AddForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0;
}
.previwImg{
    width: 100%;
}
.btnAdd{
    margin-top:15px ;
}
</style>