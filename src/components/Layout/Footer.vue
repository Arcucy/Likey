<template>
  <footer>
    <div class="footer">
      <div class="footer-container">
        <div class="info">
          <span class="info-title">General</span>
          <div class="info-content">
            <a href="/">About Us</a>
            <a href="/">Contact</a>
            <a href="/">Support</a>
            <a href="/">Become a Parner</a>
          </div>
        </div>
        <div class="info">
          <span class="info-title">Arcucy Products</span>
          <div class="info-content">
            <a href="/">ArcLight</a>
            <a href="/">Pioneer</a>
            <a href="/">ArweaveAvatar</a>
          </div>
        </div>
        <div class="icons">
          <div class="icons-links">
            <a href="/">
              <mdicon name="twitter" />
            </a>
            <a href="/">
              <mdicon name="github" />
            </a>
            <a href="/">
              <mdicon name="discord" />
            </a>
            <a href="/">
              <mdicon name="youtube" />
            </a>
          </div>
          <span class="icons-desp">Follow us on above website to get the newest updates!</span>
        </div>
      </div>
      <div class="footer-brand">
        <div class="logo">Growth</div>
        <div class="copyright">Arcucy Team ©️ 2021</div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
a {
  color: @gray1;
  text-decoration: none;
  width: fit-content;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: @light;
  }
}

footer {
  width: 100%;
  height: 250px;
  padding: 25px 30px;
  box-sizing: border-box;
  color: @light;
  background-color: @background-dark;
  display: flex;
  flex-direction: column;

  .footer {
    width: 100%;
    margin: 0 auto;
    max-width: 1200px;

    &-container {
      flex: 1;
      font-size: 14px;
      width: 100%;
      display: flex;
      flex-direction: row;

      .info {
        width: 100%;
        max-width: 200px;

        &-title {
          font-size: 16px;
          font-weight: 500;
        }

        &-content {
          font-weight: 100;
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          row-gap: 10px;
        }
      }

      .icons {
        flex-grow: 1;

        &-links {
          display: flex;
          flex-direction: row;
          column-gap: 10px;
          justify-content: flex-end;

          a {
            color: @light;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 10px;
            box-sizing: border-box;
            border-radius: 50%;
            border: 1px solid @light;
          }
        }

        &-desp {
          display: block;
          margin-top: 15px;
          text-align: right;
        }
      }
    }

    &-brand {
      margin-top: 20px;
      font-size: 12px;
      display: flex;
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;

      .logo {
        font-size: 28px;
        margin-right: 20px;
      }
    }
  }
}
</style>
