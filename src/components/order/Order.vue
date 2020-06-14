<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="scope">{{scope.row.create_time | dateFromat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-solt="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 编辑对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editddialogVisible"
      width="50%"
      @close="addRessDialogClosed"
    >
      <el-form :model="editForm" :rules="editrules" ref="editruleForm" label-width="100px">
        <el-form-item label="省市区/县" prop="ress1">
          <el-cascader v-model="editForm.ress1" :options="cityData"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="ress2">
          <el-input v-model="editForm.ress2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editddialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%" >
      <!-- 时间线 -->
  <el-timeline >
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from "./citydata.js";
export default {
  data() {
    return {
      queryInfo: {
        query: {},
        pagenum: 1,
        pagesize: 10
      },
      // 总数据条数
      total: 0,
      orderlist: [],
      editddialogVisible: false,
      progressVisible:false,
        //物流数据
      progressInfo:[],
      //   省市县
      cityData,
      //   修改地址表单数据
      editForm: {
        ress1: [],
        ress2: ""
      },
      //验证规则
      editrules: {
        ress1: [{ required: true, message: "请选择省市县", trigger: "blur" }],
        ress2: [{ required: true, message: "请输入详细地址", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        this.$message.error("获取订单列表失败!");
      }
      console.log(res);
      this.total = res.data.total;
      this.orderlist = res.data.goods;
    },
    //监听显示条数发生变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getOrderList();
    },
    //   监听页码发生变化
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getOrderList();
    },
    //展示修改地址
    showBox() {
      this.editddialogVisible = true;
    },
    //关闭编辑对话框
    addRessDialogClosed() {
      this.$refs.editruleForm.resetFields();
    },
    //物流对话框
    async showProgressBox() {
        const {data:res} =await this.$http.get('/kuaidi/1106975712662')
        if(res.meta.status!==200){
            return this.$message.error('获取物流信息失败')
        }
        this.progressInfo=res.data
        this.progressVisible=true
        console.log(this.progressInfo);
        
    }
  }
};
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>