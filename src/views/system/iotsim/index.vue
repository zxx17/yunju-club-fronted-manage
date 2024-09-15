<template>
  <div class="app-container">
    <div style="margin-bottom: 20px">
      <el-alert
        title="虚拟实验路由功能说明"
        type="warning"
        :closable="false"
        show-icon
      >
        <p>
          虚拟实验使用WebGL、Three.js等技术实现，目前不支持自定义设计实验场景，列表预设场景项目初始化完成。用户可选择开发板从0开始
        </p>
        <p>后台自定义设计实验将在2.0版本发布！</p>
      </el-alert>
    </div>

    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
          v-model="queryParams.deviceName"
          placeholder="请输入设备名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="创建时间" prop="createdTime">
        <el-date-picker
          clearable
          v-model="queryParams.createdTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择创建时间"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['iotsimlab:lab:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['iotsimlab:lab:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['iotsimlab:lab:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="labList"
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'deviceName', order: 'ascending' }"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column
        label="推荐项目"
        align="center"
        prop="projectType"
        :formatter="formatType"
      />
      <el-table-column label="路由地址" align="center" prop="projectUrl" />
      <el-table-column
        label="难度"
        align="center"
        prop="diffcult"
        :formatter="formatDif"
      />
      <el-table-column label="排序" align="center" prop="sorted" />

      <el-table-column
        label="创建时间"
        align="center"
        prop="createdTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['iotsimlab:lab:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['iotsimlab:lab:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改虚拟仿真实验对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="路由地址" prop="projectUrl">
          <el-input v-model="form.projectUrl" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item label="项目描述" prop="projectDesc">
          <el-input v-model="form.projectDesc" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="是否推荐" prop="projectType">
          <el-radio-group v-model="form.projectType">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="实验难度" prop="diffcult">
          <el-radio-group v-model="form.diffcult">
            <el-radio :label="1">初级</el-radio>
            <el-radio :label="2">中级</el-radio>
            <el-radio :label="3">高级</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="实验排序" prop="sorted">
          <el-input v-model="form.sorted" placeholder="请输入排序0-100" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listLab,
  getLab,
  delLab,
  addLab,
  updateLab,
} from "@/api/iotsimlab/lab";

export default {
  name: "Lab",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 虚拟仿真实验表格数据
      labList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceName: null,
        projectName: null,
        projectType: null,
        projectUrl: null,
        projectDesc: null,
        diffcult: null,
        sorted: null,
        finishedCount: null,
        createdBy: null,
        createdTime: null,
        isDeleted: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询虚拟仿真实验列表 */
    getList() {
      this.loading = true;
      listLab(this.queryParams).then((response) => {
        this.labList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        deviceName: null,
        projectName: null,
        projectType: null,
        projectUrl: null,
        projectDesc: null,
        diffcult: null,
        sorted: null,
        finishedCount: null,
        createdBy: null,
        createdTime: null,
        updateBy: null,
        updateTime: null,
        isDeleted: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加虚拟仿真实验";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getLab(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改虚拟仿真实验";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateLab(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLab(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除虚拟仿真实验编号为"' + ids + '"的数据项？')
        .then(function () {
          return delLab(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "iotsimlab/lab/export",
        {
          ...this.queryParams,
        },
        `lab_${new Date().getTime()}.xlsx`
      );
    },
    formatType(row, column, cellValue, index) {
      if (cellValue === 0) {
        return "否";
      } else if (cellValue === 1) {
        return "是";
      } else {
        return "未知";
      }
    },
    formatDif(row, column, cellValue, index) {
      if (cellValue === 1) {
        return "初级";
      } else if (cellValue === 2) {
        return "中级";
      } else if (cellValue === 3) {
        return "高级";
      }
    },
  },
};
</script>
