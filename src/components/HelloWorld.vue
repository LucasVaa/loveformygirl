<template>
  <div class="app">
    <header class="header">
      <h1>Like Girl</h1>
    </header>
    <main class="main-content">
      <div class="timer">
        <p>这是我们一起走过的</p>
        <h2>{{ days }}天 {{ hours }}时 {{ minutes }}分 {{ seconds }}秒</h2>
      </div>
      <div class="avatars">
        <img src="avatar1.png" alt="Avatar 1" class="avatar" />
        <img src="heart.png" alt="Heart" class="heart" />
        <img src="avatar2.png" alt="Avatar 2" class="avatar" />
      </div>
      <div class="buttons">
        <button @click="addAppreciation">点击感谢</button>
        <button @click="leaveMessage">留言板</button>
        <button @click="aboutUs">关于我们</button>
        <button @click="showLovePhoto">Love Photo</button>
        <button @click="showLoveList">Love List</button>
      </div>
    </main>
    <footer class="footer">
      <p>Copyright © 2022 - 2024 Like Girl All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      days: 875,
      hours: 23,
      minutes: 42,
      seconds: 20
    };
  },
  methods: {
    addAppreciation() {
      alert('感谢你的支持！');
    },
    leaveMessage() {
      alert('在这里留下你的留言！');
    },
    aboutUs() {
      alert('关于我们...');
    },
    showLovePhoto() {
      alert('展示爱的照片...');
    },
    showLoveList() {
      alert('展示爱的列表...');
    }
  }
};
</script>

<style scoped>
.app {
  text-align: center;
  background-color: #f5f5f5;
  padding: 20px;
}
.header {
  font-size: 24px;
  margin-bottom: 20px;
}
.main-content {
  margin: 20px 0;
}
.timer {
  margin-bottom: 20px;
}
.avatars {
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar {
  width: 100px;
  height: 100px;
}
.heart {
  width: 50px;
  height: 50px;
  margin: 0 10px;
}
.buttons {
  margin-top: 20px;
}
button {
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 16px;
}
.footer {
  margin-top: 20px;
}
</style>
