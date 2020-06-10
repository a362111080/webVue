<template>
  <div>
    <!-- 面包蟹导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">商品管理</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        class="treeTable"
        :show-row-hover="false"
      >
        <template v-slot:isok="scope">
          <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template v-slot:opt="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdit(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="adddialogVisible" width="50%" @close="addClose">
      <!-- 添加分类表单 -->
      <el-form :model="addForm" :rules="addRules" ref="ruleFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options:数据源 -->
          <!-- props:配置指定配置对象 -->
          <!-- v-model:选中的id数组 -->
          <el-cascader
            v-model="selectdKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editdialogVisible" width="50%">
      <el-form :model="editForm" :rules="addRules" ref="editFormRef" label-width="100px">
  <el-form-item label="分类名称:" prop="cat_name">
    <el-input v-model="editForm.cat_name"></el-input>
  </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      total: 0,
      //   为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 表示当前列定义为模板列
          type: "template",
          //表示当前这一列使用模板名称
          template: "isok"
        },
        {
          label: "排序",
          // 表示当前列定义为模板列
          type: "template",
          //表示当前这一列使用模板名称
          template: "order"
        },
        {
          label: "操作",
          // 表示当前列定义为模板列
          type: "template",
          //表示当前这一列使用模板名称
          template: "opt"
        }
      ],
      //控制添加分类对话框显示与隐藏
      adddialogVisible: false,
      addForm: {
        // 将要添加的分类名称
        cat_name: "",
        //父级分类id
        cat_pid: 0,
        //默认添加一级分类
        cat_level: 0
      },
      // 添加分类的表单验证规则
      addRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      
      // 父级分类列表
      parentCateList: [],

      cascaderProps: {
        checkStrictly: true,
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 选中的父级id数组
      selectdKeys: [],
      //控制编辑分类对画框隐藏与显示
      editdialogVisible: false,
      // 修改分类对象
      editForm:{}
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分页数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      console.log(res);
      //   把数据列表赋值给catelist
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //监听添加分类对话框
    showAddCateDialog() {
      // 先获取父级分类列表
      this.getParentCateList();
      this.adddialogVisible = true;
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        this.$message.error("获取父级分类失败!");
      }
      console.log(res);
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发
    parentCateChange() {
      console.log(this.selectdKeys);
      // 如果selectedKeys数组中的length大于0,证明选中的父级分类,反之,就说明没有选中任何父级分类
      if (this.selectdKeys.length > 0) {
        //父级分类的Id
        this.addForm.cat_pid = this.selectdKeys[this.selectdKeys.length - 1];
        // 为当前分类的等级赋值
        this.addForm.cat_level = this.selectdKeys.length;
      } else {
        //父级分类的Id
        this.addForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addForm.cat_level = 0;
      }
    },
    //监听关闭了添加分类对话框
    addClose() {
      this.$refs.ruleFormRef.resetFields();
      this.selectdKeys = [];
      this.addForm.cat_pid = 0;
      this.addForm.cat_level = 0;
    },
    addCate() {
      this.$refs.ruleFormRef.validate(async valil => {
        if (!valil) return;
        const { data: res } = await this.$http.post("categories", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败!");
        }
        this.$message.success("添加成功!");
        this.getCateList();
        this.adddialogVisible = false;
      });
    },
    //监听编辑对话框
    async showEdit(id) {
      const {data:res} = await this.$http.get("categories/"+id)
      if (res.meta.status!==200) {
        this.$message.error('获取分类失败!')
      }
      console.log(res);
      this.editForm=res.data
      this.editdialogVisible = true
    },
    editCate(){
      this.$refs.editFormRef.validate(async valil => {
        if (!valil) return;
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`,{cat_name:this.editForm.cat_name })
        if (res.meta.status!==200) {
          return this.$message.error('更新失败!')
        }
         this.$message.success('更新成功')
          this.editdialogVisible = false
          this.getCateList()
        })
    },
    deleteCate(id){
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete('categories/'+id)
          .then(res=>{
            if (res.data.meta.status!==200) {
              return this.$message.error('删除失败!')
            }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
            this.getCateList()   
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      
    }
 
  }
};
</script>
<style lang="postcss" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>