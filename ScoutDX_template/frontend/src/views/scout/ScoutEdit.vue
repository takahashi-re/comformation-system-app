<!-- ScoutResubmit.vue -->
<template>
  <!-- メイン -->
  <div class="main">
    <!-- 左 -->
    <div class="left">
      <div class="box-title">スカウト文入力欄</div>
      <div class="box-content">
        <textarea
          v-model="scout.body"
          class="textarea"
          placeholder="（スカウト文を入力・編集）"
        ></textarea>
      </div>
    </div>

    <!-- 右 -->
    <div class="right">
      <div class="box-title">差戻しコメント</div>
      <div class="box-content">
        <div class="comment-box" v-if="latestRejectComment">
          {{ latestRejectComment }}
        </div>
        <div class="comment-box" v-else>差戻しコメントはありません</div>
      </div>
      <div class="actions">
        <button class="btn save" @click="saveDraft">保存</button>
        <button class="btn submit" @click="submit">申請</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchScoutDetail, updateScout } from "../../api/scoutApi";

const route = useRoute();
const router = useRouter();
const scoutId = route.params.id;

// state
const scout = ref({
  id: null,
  body: "",
});

const latestRejectComment = ref(null);
const loading = ref(true);

// 初期表示（DBから取得）
onMounted(async () => {
  loading.value = true;

  try {
    const res = await fetchScoutDetail(scoutId);

    // 最新スカウト文
    scout.value = res.scout;

    // 最新差戻しコメント
    latestRejectComment.value = res.latestRejectComment;

    // ここでテキストエリアに反映
    scout.value.body = res.scout.body;
  } finally {
    loading.value = false;
  }
});

/**
 * 保存（下書き保存）
 * → status: DRAFT
 */
const saveDraft = async () => {
  await updateScout({
    id: scout.value.id,
    body: scout.value.body,
    status: "DRAFT",
  });

  // 一覧へ戻る（図の最後）
  router.push("/scout/list");
};

/**
 * 申請
 * → バリデーション → OKなら承認待ち
 */
const submit = async () => {
  // バリデーションチェック（図の分岐）
  if (!scout.value.body || scout.value.body.trim() === "") {
    alert("スカウト文を入力してください");
    return;
  }
  //NGワード、文字数チェック実装などもここで行う。フロントでやるか、バックでやるか？？？

  await updateScout({
    id: scout.value.id,
    body: scout.value.body,
    status: "PENDING_APPROVER", // 承認者承認待ち
  });

  alert("申請しました");

  // 一覧へ戻る（図の最後）
  router.push("/scout/list");
};
</script>

<style scoped>
.container {
  padding: 20px;
}

/* メイン左右 */
.main {
  display: flex;
  gap: 20px;
}

/* 左側：スカウト入力 */
.left {
  flex: 2;
}

/* 右側：コメント */
.right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* タイトルバー */
.box-title {
  background: #2f6da3;
  color: white;
  padding: 6px 10px;
  font-weight: bold;
}

/* テキストエリア（大きく） */
.textarea {
  width: 100%;
  height: 100%; /* 親要素に合わせる */
  border: none;
  resize: none;
  padding: 10px;
  background: transparent;
  box-sizing: border-box; /* パディングを含めてサイズを計算 */
  font-size: 16px;
  font-family: Arial, sans-serif;
}

/* 中身 */
.box-content {
  border: 1px solid #ccc;
  background: #fff;
  padding: 0; /* パディングを削除 */
  height: 350px; /* テキストエリアと同じ高さに */
}

/* コメントボックス */
.comment-box {
  height: 330px;
  background: #fff;
  border: none;
  padding: 10px;
  font-size: 16px;
  font-family: Arial, sans-serif;
}

/* ボタン */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 20px;
}

/* ボタン共通 */
.btn {
  padding: 10px 40px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border: 2px solid #020303;
}

/* 保存 */
.save {
  background-color: #3c78b4;
  color: white;
}

/* 申請 */
.submit {
  background-color: #3c78b4;
  color: white;
}
</style>
