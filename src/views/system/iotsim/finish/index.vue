<template>
  <div>
    <el-row :gutter="20">
      <!-- 趋势图所在的列 -->
      <el-col :span="12">
        <div ref="trendChart" style="width: 100%; height: 400px"></div>
      </el-col>
      <!-- 条形图所在的列 -->
      <el-col :span="12">
        <div ref="barChart" style="width: 100%; height: 400px"></div>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-row>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:user:export']"
          >导出报告</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="userList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="用户昵称" align="center" prop="nickName" />
      <el-table-column label="实验名称" align="center" prop="simLabName" />
      <el-table-column label="完成状态" align="center" prop="isFinished">
        <template slot-scope="scope">
          <span
            :style="{ color: scope.row.isFinished === 1 ? 'green' : 'red' }"
          >
            {{ scope.row.isFinished === 1 ? "已完成" : "未完成" }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="时间"
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
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:user:remove']"
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
  </div>
</template>

<script>
// 引入 ECharts
import * as echarts from "echarts";
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  userSimLabWeekData,
  simLabFinishData,
} from "@/api/iotsimlab/finish";

export default {
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
      // 虚拟仿真实验用户记录表格数据
      userList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        simLabId: null,
        isFinished: null,
        createdBy: null,
        createdTime: null,
        isDeleted: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      // 近一周模拟实验完成情况数据列表
      userSimLabWeekListData: [0, 0, 0, 0, 0, 0, 0],
      //虚拟仿真实验完成数量x,y
      simLabFinishDataX: [
        "实验1",
        "实验2",
        "实验3",
        "实验4",
        "实验5",
        "实验6",
        "实验7",
      ],
      simLabFinishDataY: [
        100,
        {
          value: 200,
          itemStyle: {
            color: "#a90000",
          },
        },
        150,
        80,
        70,
        110,
        130,
      ],
    };
  },
  created() {
    this.getList();
    this.getUserSimLabWeekData();
    this.getSimLabFinishData();
  },
  mounted() {
    // 在组件挂载后初始化图表
    this.initTrendChart();
    this.initBarChart();
  },
  methods: {
    // 折线
    initTrendChart() {
      // 基于准备好的dom，初始化echarts实例
      var trendChart = echarts.init(this.$refs.trendChart);
      // 指定图表的配置项和数据
      var trendOption = {
        title: {
          text: "虚拟仿真实验近一周完成趋势",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.userSimLabWeekListData,
            type: "line",
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      trendChart.setOption(trendOption);
    },
    // 条形
    initBarChart() {
      // 基于准备好的dom，初始化echarts实例
      var barChart = echarts.init(this.$refs.barChart);
      // 指定图表的配置项和数据
      var barOption = {
        title: {
          text: "虚拟仿真实验完成数量前五",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: this.simLabFinishDataX,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.simLabFinishDataY,
            type: "bar",
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      barChart.setOption(barOption);
    },
    /** 查询虚拟仿真实验用户记录列表 */
    getList() {
      this.loading = true;
      listUser(this.queryParams).then((response) => {
        this.userList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 查询近一周模拟实验完成情况
    getUserSimLabWeekData() {
      userSimLabWeekData().then((response) => {
        this.userSimLabWeekListData = response.rows;
        this.initTrendChart();
      });
    },
    // 查询虚拟仿真实验完成数量
    getSimLabFinishData() {
      simLabFinishData().then((response) => {
        this.simLabFinishDataX = response.xAxis;
        this.simLabFinishDataY = response.yAxis;
        this.initBarChart();
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
        userId: null,
        simLabId: null,
        isFinished: null,
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
      this.title = "添加虚拟仿真实验用户记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getUser(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改虚拟仿真实验用户记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateUser(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then((response) => {
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
        .confirm(
          '是否确认删除虚拟仿真实验用户记录编号为"' + ids + '"的数据项？'
        )
        .then(function () {
          return delUser(ids);
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
        "iotsimlab/lab/finish/export",
        {
          ...this.queryParams,
        },
        `user_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>

<style>
.el-row {
  margin-top: 20px;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}
</style>
