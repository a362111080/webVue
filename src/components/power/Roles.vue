<template>
  <div>
    <!-- 面包蟹导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">权限管理</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <!-- <el-col> -->
        <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        <!-- </el-col> -->
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级 -->
              <el-col :span="19">
                <!-- 嵌套循环二级权限 -->
                <el-row
                  :class="[i2===0 ? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success"
                    closable @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3,i3) in item2.children" 
                    :key="item3.id" 
                    closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-eidt"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting"
            @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" width="50%" :visible.sync="addDialogVisible" @close="addDialogClosed">
      <!-- 内容主题区 -->
      <el-form :model="addForm" label-width="70px" ref="addFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" type="textarea" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" width="50%" :visible.sync="editDialogVisible" @close="editDialogClosed">
      <!-- 内容主题区 -->
      <el-form :model="editForm" label-width="70px" ref="editFormRef">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" type="textarea">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
  title="分配权限"
  :visible.sync="setSetRightDialogVisible"
  width="50%">
  <!-- 树形结构 -->
  <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
    <el-button @click="setSetRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>

</el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolelist: [],
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      //查询到的用户信息对象
      editForm: {},
    //   控制分配权限对话框的显示与隐藏
    setSetRightDialogVisible:false,
    // 所有权限的数据
    rightslist:[],
    // 这是树形控件的绑定对象
    treeProps:{
        //可看见的属性
        label:'authName',
        //通过什么嵌套
        children:'children',
    },
        // 默认选中的节点数组
        defKeys:[],
        // 即将分配权限的角色id
        roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败!");
      }
      this.rolelist = res.data;

      console.log(this.rolelist);
    },
    //添加角色
    async addRoles() {
      const { data: res } = await this.$http.post("roles", this.addForm);
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg + "");
      }
      this.$message.success(res.meta.msg + "");
      // 隐藏添加成功的对话框
      this.addDialogVisible = false;
      //刷新列表
      this.getRolesList();
    },
    //监听添加角色关闭对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg + "");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    async editRoles() {
      const { data: res } = await this.$http.put(
        "roles/" + this.editForm.roleId,
        { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg + "");
      }
      this.$message.success("修改成功!");
      // 隐藏添加成功的对话框
      this.editDialogVisible = false;
      //刷新列表
      this.getRolesList();
    },
    //监听编辑角色关闭对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //删除时提示框
    removeRolesById(id) {
      //提示用户是否删除数据
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http.delete("roles/" + id);
          this.getRolesList();
          this.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //根据Id删除对应权限
    async  removeRightById(role,rightId){
    //弹框提示是否删除
    const confirmResult = await  
     this.$confirm(
         '此操作将永久删除该权限, 是否继续?', '提示', 
         {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
     }).catch(err=>err)
     if(confirmResult!=='confirm'){
         return this.$message.info('取消了删除')
     }
     const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
     if(res.meta.status!==200){
         return this.$message.error("删除权限失败")
     }
    //  this.getRolesList()
    role.children=res.data
  },
  //展示分配权限对话框
  async showSetRightDialog(role){
      this.roleId=role.id
      this.defKeys=[]
      //   获取所有权限
    const {data:res}= await this.$http.get("rights/tree")
    if(res.meta.status!==200){
         return this.$message.error("获取权限失败")
     }
    //  获取到的权限数据保存到data中
     this.rightslist=res.data
     console.log(this.rightslist);
     //递归获取三级节点的id
     this.getLeafKeys(role,this.defKeys)

      this.setSetRightDialogVisible=true
  },
  //通过递归的形式，获取角色下所有三级权限的Id，并保存到defKeys数组中
   getLeafKeys (node, arr) {
      // 没有children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 点击为角色分配权限
    async allotRights(){
        const keys=[
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
       const str= keys.join(",")
       const {data:res}= await this.$http.post(`roles/${this.roleId}/rights`,{rids:str})
       if(res.meta.status!==200){
           this.$message.error('分配权限失败！')
       }
       this.$message.success('分配权限成功！')
       this.getRolesList()
       this.setSetRightDialogVisible=false
    }
}
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>