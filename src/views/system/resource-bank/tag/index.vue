<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="分类名称" prop="categoryName">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="请输入分类名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="父级id" prop="parentId">
        <el-input
          v-model="queryParams.parentId"
          placeholder="请输入父级id"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['qsbank:category:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['qsbank:category:edit']"
          >修改</el-button
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
          v-hasPermi="['qsbank:category:remove']"
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
          v-hasPermi="['qsbank:category:export']"
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
      :data="categoryList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="分类名称" align="center" prop="categoryName" />
      <el-table-column label="分类类型" align="center" prop="categoryType">
        <template slot-scope="scope">
          <span
            :style="{ color: scope.row.categoryType === 1 ? 'green' : 'blue' }"
          >
            {{ scope.row.categoryType === 1 ? "一级分类" : "二级分类" }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="父级id" align="center" prop="parentId" />
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
            v-hasPermi="['qsbank:category:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['qsbank:category:remove']"
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

    <!-- 添加或修改题目分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类类型" prop="categoryType">
          <el-select
            v-model="form.categoryType"
            placeholder="请选择分类类型"
            @change="handleCategoryTypeChange"
          >
            <el-option label="一级分类" value="1"></el-option>
            <el-option label="二级分类" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="父级编号"
          prop="parentId"
          :rules="
            form.categoryType === '2'
              ? [
                  {
                    required: true,
                    message: '父级编号不能为空',
                    trigger: 'blur',
                  },
                ]
              : []
          "
        >
          <el-input
            v-model="form.parentId"
            placeholder="请输入父级编号"
            :disabled="form.categoryType !== '2'"
          />
        </el-form-item>
        <!-- label -->
        <div v-show="form.categoryType === 1">
          <el-divider content-position="center">题目标签信息</el-divider>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAddSubjectLabel"
                >添加</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="handleDeleteSubjectLabel"
                >删除</el-button
              >
            </el-col>
          </el-row>
          <el-table
            :data="subjectLabelList"
            :row-class-name="rowSubjectLabelIndex"
            @selection-change="handleSubjectLabelSelectionChange"
            ref="subjectLabel"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              label="编号"
              align="center"
              prop="index"
              width="50"
            />
            <el-table-column label="标签名称" prop="labelName" width="150">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.labelName"
                  placeholder="请输入标签名称"
                />
              </template>
            </el-table-column>
            <el-table-column label="排序" prop="sortNum" width="150">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.sortNum"
                  placeholder="请输入排序"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
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
  listCategory,
  getCategory,
  delCategory,
  addCategory,
  updateCategory,
} from "@/api/qsbank/category";

export default {
  name: "Category",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedSubjectLabel: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 题目分类表格数据
      categoryList: [],
      // 题目标签表格数据
      subjectLabelList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryName: null,
        categoryType: null,
        imageUrl: null,
        parentId: null,
        isDeleted: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        categoryName: [
          { required: true, message: "分类名称不能为空", trigger: "blur" },
        ],
        categoryType: [
          { required: true, message: "分类类型不能为空", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询题目分类列表 */
    getList() {
      this.loading = true;
      listCategory(this.queryParams).then((response) => {
        this.categoryList = response.rows;
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
        categoryName: null,
        categoryType: null,
        imageUrl: null,
        parentId: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        isDeleted: null,
      };
      this.subjectLabelList = [];
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
      this.title = "添加题目分类";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getCategory(id).then((response) => {
        this.form = response.data;
        this.subjectLabelList = response.data.subjectLabelList;
        this.open = true;
        this.title = "修改题目分类";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.subjectLabelList = this.subjectLabelList;
          if (this.form.id != null) {
            updateCategory(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCategory(this.form).then((response) => {
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
        .confirm('是否确认删除题目分类编号为"' + ids + '"的数据项？')
        .then(function () {
          return delCategory(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 题目标签序号 */
    rowSubjectLabelIndex({ row, rowIndex }) {
      row.index = rowIndex + 1;
    },
    /** 题目标签添加按钮操作 */
    handleAddSubjectLabel() {
      let obj = {};
      obj.labelName = "";
      obj.sortNum = "";
      obj.isDeleted = "";
      this.subjectLabelList.push(obj);
    },
    /** 题目标签删除按钮操作 */
    handleDeleteSubjectLabel() {
      if (this.checkedSubjectLabel.length == 0) {
        this.$modal.msgError("请先选择要删除的题目标签数据");
      } else {
        const subjectLabelList = this.subjectLabelList;
        const checkedSubjectLabel = this.checkedSubjectLabel;
        this.subjectLabelList = subjectLabelList.filter(function (item) {
          return checkedSubjectLabel.indexOf(item.index) == -1;
        });
      }
    },
    /** 复选框选中数据 */
    handleSubjectLabelSelectionChange(selection) {
      this.checkedSubjectLabel = selection.map((item) => item.index);
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "qsbank/category/export",
        {
          ...this.queryParams,
        },
        `category_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
