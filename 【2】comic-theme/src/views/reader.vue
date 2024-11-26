<!-- 阅读页 -->

<template>
  <div
    class="reader-wrapper"
    :class="{
      'in-mobile': inMobile,
      'in-pc': !inMobile,
      'scroll-mode': contentImgList.length !== 0 && mode[0] === 'scroll',
      light: theme === 'light',
      dark: theme === 'dark'
    }"
    @click="clickPage()"
  >
    <reader-header :comicInfo="comicInfo" :show="barShow" @changeBarShow="changeBarShow" />

    <my-loader v-if="loading" />

    <!-- mobile -->
    <template v-if="!loading && inMobile">
      <div class="mobile-body-wrapper">
        <template v-if="comicInfo?.articleInfo?.status === 1">
          <template v-if="comicInfo.onlineStatus === 0">
            <div
              class="exceptional-box"
              :class="{ light: theme === 'light', dark: theme === 'dark' }"
            >
              <div class="icon">
                <i class="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"></i>
              </div>
              <span class="exceptional-text"> 作品已下架，无法访问 </span>
            </div>
          </template>

          <template v-else-if="![0, 4].includes(comicInfo?.defaulterIdentityType)">
            <div
              class="exceptional-box"
              :class="{ light: theme === 'light', dark: theme === 'dark' }"
            >
              <div class="icon">
                <i class="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"> </i>
              </div>
              <span class="exceptional-text"> 作品异常，无法访问 </span>
            </div>
          </template>

          <template
            v-else-if="comicInfo.defaulterIdentityType === 4 || userData?.isLogin === false"
          >
            <div class="lock-box">
              <img class="lock" src="../assets/images/lock.png" alt="未授权" />
              <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
              <div class="get-btn" @click="getAuth()">获取授权</div>
            </div>
          </template>

          <template v-else-if="!['漫画'].includes(comicInfo?.articleInfo.resourceType[1])">
            <div
              class="exceptional-box"
              :class="{ light: theme === 'light', dark: theme === 'dark' }"
            >
              <div class="icon">
                <i class="freelog fl-icon-yichang_wenjiangeshicuowu freeze"> </i>
              </div>
              <span class="exceptional-text">此作品格式暂不支持访问 </span>
            </div>
          </template>

          <template v-else-if="comicInfo.defaulterIdentityType === 0">
            <template v-if="mode[0] === 'paging'">
              <my-swipe
                class="paging-area"
                :initial-swipe="swipeIndex"
                :loop="false"
                :show-indicators="false"
                @change="swipePage"
                :lazy-render="true"
              >
                <my-swipe-item
                  class="swipe-image-box"
                  v-for="item in mobilePagingList"
                  :key="item.name"
                >
                  <div
                    v-if="
                      (currentSortID === collectionTotal || !query.subId) &&
                      item.name === 'RecommendFakeUrl'
                    "
                    class="paging-recommend-box"
                    :class="{ 'no-more-box': currentSortID === collectionTotal || !query.subId }"
                  >
                    <div class="no-more">
                      <img
                        v-if="theme === 'light'"
                        src="@/assets/images/all-loaded-light.png"
                        alt="已加载全部内容"
                      />
                      <img v-else src="@/assets/images/all-loaded-dark.png" alt="已加载全部内容" />
                    </div>
                    <div v-if="recommendList.length">
                      <p class="more">更多漫画</p>
                      <div class="recommend-item-wrap">
                        <div
                          class="recommend-item"
                          v-for="item in recommendList.slice(0, 3)"
                          :key="item.exhibitId"
                          @click="toDetailFromRecommend(item.exhibitId)"
                        >
                          <div class="cover-image">
                            <img :src="item.coverImages[0]" :alt="item.exhibitTitle" />
                          </div>
                          <span class="title">{{ item.exhibitTitle }}</span>
                          <span class="name">{{ item.articleInfo?.articleOwnerName }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-else class="to-home">
                      <span @click.stop="switchPage('/home')">回首页寻找更多漫画 >></span>
                    </div>
                  </div>
                  <img v-else class="swipe-image" :src="item.url" oncontextmenu="return false" />
                </my-swipe-item>
              </my-swipe>
            </template>

            <template v-else-if="mode[0] === 'scroll'">
              <img
                class="content-image"
                :style="{ height: item.height + 'px' }"
                v-lazy="item.url"
                oncontextmenu="return false"
                v-for="item in contentImgList"
                :key="item.name"
              />
              <div
                v-if="currentSortID === collectionTotal || !query.subId"
                class="scroll-recommend-box"
              >
                <div class="no-more">
                  <img
                    v-if="theme === 'light'"
                    src="@/assets/images/all-loaded-light.png"
                    alt="已加载全部内容"
                  />
                  <img v-else src="@/assets/images/all-loaded-dark.png" alt="已加载全部内容" />
                </div>

                <div v-if="recommendList.length">
                  <p class="more">更多漫画</p>
                  <div class="recommend-item-wrap">
                    <div
                      class="recommend-item"
                      :class="{ light: theme === 'light', dark: theme === 'dark' }"
                      v-for="item in recommendList.slice(0, 6)"
                      :key="item.exhibitId"
                      @click="toDetailFromRecommend(item.exhibitId)"
                    >
                      <div class="cover-image">
                        <img :src="item.coverImages[0]" :alt="item.exhibitTitle" />
                      </div>
                      <span class="title">{{ item.exhibitTitle }}</span>
                      <span class="name">{{ item.articleInfo?.articleOwnerName }}</span>
                    </div>
                  </div>
                </div>

                <div v-else class="to-home">
                  <span @click.stop="switchPage('/home')">回首页寻找更多漫画 >></span>
                </div>
              </div>
            </template>
          </template>
        </template>

        <template v-else>
          <div class="freeze-exhibit">
            <div class="icon">
              <i
                class="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"
                :class="{ light: theme === 'light', dark: theme === 'dark' }"
              ></i>
            </div>
            <span class="exceptional-text"> 此作品因违规无法访问 </span>
          </div>
        </template>
      </div>

      <!-- 控制栏 👇 -->
      <transition name="fade-down">
        <div class="mobile-operater-wrapper" @touchmove.prevent v-show="barShow">
          <!-- 前一话 -->
          <div
            class="operate-btn"
            @click="previousChapter()"
            v-if="comicInfo.collectionList?.length && currentSortID !== 1"
          >
            <i class="freelog fl-icon-xiangxiazhankai pre-btn"></i>
            <div class="operater-btn-label">前一话</div>
          </div>
          <!-- 目录 -->
          <div
            class="operate-btn"
            @click.stop="catalogueModal = true"
            v-if="comicInfo.collectionList?.length"
          >
            <i class="freelog fl-icon-xiaoshuomulu1"></i>
            <div class="operater-btn-label">目录</div>
          </div>
          <!-- 收藏 -->
          <div class="operate-btn" @click="operateShelf(comicInfo)">
            <i
              class="freelog"
              :class="`fl-icon-${isCollected ? 'shoucangxiaoshuoyishoucang' : 'shoucangxiaoshuo'}`"
            ></i>
            <div class="operater-btn-label">{{ isCollected ? "取消收藏" : "加入收藏" }}</div>
          </div>
          <!-- 阅读模式 -->
          <div class="operate-btn" @click.stop="modeMenuShow = true">
            <i class="freelog fl-icon-shujia1"></i>
            <div class="operater-btn-label">阅读模式</div>
          </div>
          <!-- 下一话 -->
          <div
            class="operate-btn"
            @click="nextChapter()"
            v-if="comicInfo.collectionList?.length && currentSortID !== collectionTotal"
          >
            <i class="freelog fl-icon-xiangxiazhankai next-btn"></i>
            <div class="operater-btn-label">下一话</div>
          </div>
        </div>
      </transition>

      <!-- 3种阅读模式 -->
      <transition name="fade-down">
        <div class="mobile-mode-menu" @touchmove.prevent @click.stop v-if="modeMenuShow && barShow">
          <div class="menu-title">阅读模式</div>
          <div class="menu-btns">
            <div
              class="menu-btn"
              :class="{ active: mode[2] === 'normal' && mode[0] === 'paging' }"
              @click="changeMode('normal', 2)"
            >
              <i class="freelog fl-icon-xiangxia right"></i>
              <div class="btn-label">普通模式</div>
            </div>
            <div
              class="menu-btn"
              :class="{ active: mode[2] === 'manga' && mode[0] === 'paging' }"
              @click="changeMode('manga', 2)"
            >
              <i class="freelog fl-icon-xiangxia left"></i>
              <div class="btn-label">日漫模式</div>
            </div>
            <div
              class="menu-btn"
              :class="{ active: mode[0] === 'scroll' }"
              @click="changeMode('scroll', 0)"
            >
              <i class="freelog fl-icon-xiangxia"></i>
              <div class="btn-label">滚动模式</div>
            </div>
          </div>
        </div>
      </transition>
    </template>

    <!-- PC -->
    <template v-if="!loading && !inMobile">
      <div class="body-area" :class="theme">
        <template v-if="comicInfo?.articleInfo?.status === 1">
          <template v-if="comicInfo.onlineStatus === 0">
            <div
              class="exceptional-box"
              :class="{ light: theme === 'light', dark: theme === 'dark' }"
            >
              <div class="icon">
                <i class="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"></i>
              </div>
              <span class="exceptional-text"> 作品已下架，无法访问 </span>
            </div>
          </template>

          <template v-else-if="![0, 4].includes(comicInfo?.defaulterIdentityType)">
            <div
              class="exceptional-box"
              :class="{ light: theme === 'light', dark: theme === 'dark' }"
            >
              <div class="icon">
                <i class="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"> </i>
              </div>
              <span class="exceptional-text"> 作品异常，无法访问 </span>
            </div>
          </template>

          <template
            v-else-if="comicInfo.defaulterIdentityType === 4 || userData?.isLogin === false"
          >
            <div class="lock-box">
              <img class="lock" src="../assets/images/lock.png" alt="未授权" />
              <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
              <div class="get-btn" @click="getAuth()">获取授权</div>
            </div>
          </template>

          <template v-else-if="!['漫画'].includes(comicInfo?.articleInfo.resourceType[1])">
            <div
              class="exceptional-box"
              :class="{ light: theme === 'light', dark: theme === 'dark' }"
            >
              <div class="icon">
                <i class="freelog fl-icon-yichang_wenjiangeshicuowu freeze"> </i>
              </div>
              <span class="exceptional-text">此作品格式暂不支持访问 </span>
            </div>
          </template>

          <template v-else-if="comicInfo.defaulterIdentityType === 0">
            <div class="paging-mode-area" v-if="mode[0] === 'paging'">
              <!-- 条漫/页漫、双页模式、非跨页匹配、当前为首页时，首页左侧显示空屏 -->
              <div
                class="blank-screen"
                v-if="
                  [1, 2].includes(comicMode) && mode[1] === 'double' && !amend && currentPage === 1
                "
              ></div>
              <!-- 日漫、双页模式、页数不为1且当前为尾页/页数为1且跨页匹配时，尾页左侧显示空屏 -->
              <div
                class="blank-screen"
                v-if="
                  comicMode === 3 &&
                  mode[1] === 'double' &&
                  ((contentImgList.length !== 1 && currentPage === contentImgList.length) ||
                    (contentImgList.length === 1 && amend))
                "
              >
                <div v-if="currentSortID === collectionTotal || !query.subId" class="recommend-box">
                  <div class="no-more">— 已加载全部内容 —</div>
                  <div v-if="recommendList.length">
                    <p class="more" :style="{ color: theme === 'light' ? 'inherit' : '' }">
                      更多漫画
                    </p>
                    <div
                      class="recommend-item"
                      v-for="item in recommendList.slice(0, 4)"
                      :key="item.exhibitId"
                      @click="toDetailFromRecommend(item.exhibitId)"
                    >
                      <div class="cover-image">
                        <img :src="item.coverImages[0]" :alt="item.exhibitTitle" />
                      </div>
                      <div class="recommend-info">
                        <span class="name">{{ item.exhibitTitle }}</span>
                        <span class="type">{{ item?.articleInfo?.articleOwnerName }}</span>
                        <div class="tags-wrap">
                          <div
                            class="tag"
                            v-for="(tag, index) in item.tags"
                            :key="index"
                            @click.stop="searchTag(tag)"
                          >
                            {{ tag }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 日漫、双页模式、跨页匹配/非跨页匹配且当前不为首页、当前页不为尾页时，当前页左侧显示下一页 -->
              <div
                class="content-image-box"
                v-if="
                  comicMode === 3 &&
                  mode[1] === 'double' &&
                  (amend || (!amend && currentPage !== 1)) &&
                  currentPage !== contentImgList.length &&
                  nextUrl
                "
              >
                <img class="content-image" :src="nextUrl" />
              </div>
              <!-- 当前页 -->
              <div
                class="content-image-box"
                :class="{ single: mode[1] === 'single' }"
                v-if="currentUrl"
              >
                <img class="content-image" :src="currentUrl" />
                <!-- 单页-推荐 -->
                <div
                  v-if="
                    !nextUrl &&
                    mode[1] === 'single' &&
                    (currentSortID === collectionTotal || !query.subId)
                  "
                  class="recommend-box"
                >
                  <div class="no-more">
                    <img
                      v-if="theme === 'light'"
                      src="@/assets/images/all-loaded-light.png"
                      alt="已加载全部内容"
                    />
                    <img v-else src="@/assets/images/all-loaded-dark.png" alt="已加载全部内容" />
                  </div>
                  <div v-if="recommendList.length">
                    <p class="more" :style="{ color: theme === 'light' ? 'inherit' : '' }">
                      更多漫画
                    </p>
                    <div
                      class="recommend-item"
                      :class="{ light: theme === 'light', dark: theme === 'dark' }"
                      v-for="item in recommendList.slice(0, 3)"
                      :key="item.exhibitId"
                      @click="toDetailFromRecommend(item.exhibitId)"
                    >
                      <div class="cover-image">
                        <img :src="item.coverImages[0]" :alt="item.exhibitTitle" />
                      </div>
                      <div class="recommend-info">
                        <span class="name">{{ item.exhibitTitle }}</span>
                        <span class="type">{{ item?.articleInfo?.articleOwnerName }}</span>
                        <div class="tags-wrap">
                          <div
                            class="tag"
                            v-for="(tag, index) in item.tags"
                            :key="index"
                            @click.stop="searchTag(tag)"
                          >
                            {{ tag }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="to-home">
                    <span @click.stop="switchPage('/home')">回首页寻找更多漫画 >></span>
                  </div>
                </div>
              </div>
              <!-- 条漫/页漫、双页模式、跨页匹配/非跨页匹配且当前不为首页、当前页不为尾页时，当前页右侧显示下一页 -->
              <div
                class="content-image-box"
                v-if="
                  [1, 2].includes(comicMode) &&
                  mode[1] === 'double' &&
                  (amend || (!amend && currentPage !== 1)) &&
                  currentPage !== contentImgList.length &&
                  nextUrl
                "
              >
                <img class="content-image" :src="nextUrl" />
              </div>
              <!-- 条漫/页漫、双页模式、页数不为1且当前为尾页/页数为1且跨页匹配时，尾页右侧显示空屏 -->
              <div
                class="blank-screen"
                v-if="
                  [1, 2].includes(comicMode) &&
                  mode[1] === 'double' &&
                  ((contentImgList.length !== 1 && currentPage === contentImgList.length) ||
                    (contentImgList.length === 1 && amend))
                "
              >
                <div v-if="currentSortID === collectionTotal || !query.subId" class="recommend-box">
                  <div class="no-more">
                    <img
                      v-if="theme === 'light'"
                      src="@/assets/images/all-loaded-light.png"
                      alt="已加载全部内容"
                    />
                    <img v-else src="@/assets/images/all-loaded-dark.png" alt="已加载全部内容" />
                  </div>
                  <div v-if="recommendList.length">
                    <p class="more" :style="{ color: theme === 'light' ? 'inherit' : '' }">
                      更多漫画
                    </p>
                    <div
                      class="recommend-item"
                      :class="{ light: theme === 'light', dark: theme === 'dark' }"
                      v-for="item in recommendList.slice(0, 3)"
                      :key="item.exhibitId"
                      @click="toDetailFromRecommend(item.exhibitId)"
                    >
                      <div class="cover-image">
                        <img :src="item.coverImages[0]" :alt="item.exhibitTitle" />
                      </div>
                      <div class="recommend-info">
                        <span class="name">{{ item.exhibitTitle }}</span>
                        <span class="type">{{ item?.articleInfo?.articleOwnerName }}</span>
                        <div class="tags-wrap">
                          <div
                            class="tag"
                            v-for="(tag, index) in item.tags"
                            :key="index"
                            @click.stop="searchTag(tag)"
                          >
                            {{ tag }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="to-home">
                    <span @click.stop="switchPage('/home')">回首页寻找更多漫画 >></span>
                  </div>
                </div>
              </div>
              <!-- 日漫、双页模式、非跨页匹配、当前为首页时，首页右侧显示空屏 -->
              <div
                class="blank-screen"
                v-if="mode[1] === 'double' && comicMode === 3 && !amend && currentPage === 1"
              ></div>

              <div
                class="pre-btn"
                @click="leftSwitchPage()"
                v-if="
                  (currentPage !== 1 && mode[2] === 'normal') ||
                  (currentPage < contentImgList.length - (mode[1] === 'single' ? 0 : 1) &&
                    mode[2] === 'manga')
                "
              ></div>
              <div
                class="next-btn"
                @click="rightSwitchPage()"
                v-if="
                  (currentPage < contentImgList.length - (mode[1] === 'single' ? 0 : 1) &&
                    mode[2] === 'normal') ||
                  (currentPage !== 1 && mode[2] === 'manga')
                "
              ></div>
            </div>

            <div
              class="scroll-mode-area"
              :style="{ height: totalHeight + 'px' }"
              v-else-if="mode[0] === 'scroll'"
            >
              <img
                class="content-image"
                :style="{ height: item.height + 'px' }"
                v-lazy="item.url"
                oncontextmenu="return false"
                v-for="item in contentImgList"
                :key="item.name"
              />
              <div
                v-if="currentSortID === collectionTotal || !query.subId"
                class="pc-scroll-recommend-box"
                :class="theme"
              >
                <div class="pc-scroll-recommend">
                  <div class="no-more">
                    <img
                      v-if="theme === 'light'"
                      src="@/assets/images/all-loaded-light.png"
                      alt="已加载全部内容"
                    />
                    <img v-else src="@/assets/images/all-loaded-dark.png" alt="已加载全部内容" />
                  </div>
                  <div v-if="recommendList.length">
                    <p class="more" :style="{ color: theme === 'light' ? 'inherit' : '' }">
                      更多漫画
                    </p>
                    <div class="recommend-item-wrap">
                      <div
                        class="recommend-item"
                        :class="{ light: theme === 'light', dark: theme === 'dark' }"
                        v-for="item in recommendList.length > 5
                          ? recommendList.slice(0, 5)
                          : recommendList"
                        :key="item.exhibitId"
                        @click="toDetailFromRecommend(item.exhibitId)"
                      >
                        <div class="cover-image">
                          <img :src="item.coverImages[0]" :alt="item.exhibitTitle" />
                        </div>
                        <div class="recommend-info">
                          <span class="name">{{ item.exhibitTitle }}</span>
                          <span class="type">{{ item?.articleInfo?.articleOwnerName }}</span>
                          <div class="tags-wrap">
                            <div
                              class="tag"
                              v-for="(tag, index) in item.tags"
                              :key="index"
                              @click.stop="searchTag(tag)"
                            >
                              {{ tag }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        class="recommend-item-to-home"
                        :class="{ light: theme === 'light', dark: theme === 'dark' }"
                      >
                        <span @click.stop="switchPage('/home')">回首页寻找更多漫画 >></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>

        <template v-else>
          <div class="freeze-exhibit">
            <div class="icon">
              <i
                class="freelog fl-icon-a-yichang_wendangbokexiaoshuoziyuan freeze"
                :class="{ light: theme === 'light', dark: theme === 'dark' }"
              ></i>
            </div>
            <span class="exceptional-text"> 此作品因违规无法访问 </span>
          </div>
        </template>
      </div>

      <div class="operater-wrapper">
        <div class="operater-btns-box">
          <!-- 目录 -->
          <operate-btn
            v-if="comicInfo.collectionList?.length"
            :icon="theme === 'light' ? 'fl-icon-xiaoshuomulu' : 'fl-icon-xiaoshuomulu'"
            :theme="theme"
            @click="
              clickPage();
              setCatalogueModal();
            "
          />

          <!-- 收藏 -->
          <operate-btn
            :icon="isCollected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'"
            :theme="theme"
            @click="
              clickPage();
              operateShelf(comicInfo);
            "
          />

          <!-- 分享 -->
          <operate-btn
            icon="fl-icon-fenxiang"
            :theme="theme"
            @click.stop="setShareWidgetShow(true)"
          >
            <div id="share" class="share-wrapper" />
          </operate-btn>

          <!-- 切换模式 -->
          <operate-btn
            :icon="theme === 'light' ? 'fl-icon-rijianmoshi' : 'fl-icon-yejianmoshi'"
            :theme="theme"
            @click="
              clickPage();
              setTheme();
            "
          />

          <!-- 回到顶部 -->
          <back-top>
            <div class="back-top">
              <operate-btn icon="fl-icon-huidaodingbu" :theme="theme" />
            </div>
          </back-top>
        </div>
      </div>

      <div
        class="reader-footer"
        :class="{ show: barShow }"
        @mousemove="changeBarShow(true)"
        @mouseleave="changeBarShow(false)"
        v-if="contentImgList.length !== 0"
      >
        <div class="footer-body">
          <div class="pager">
            当前页
            <!-- 条漫/页漫、翻页模式、双页模式、非跨页匹配、当前为首页时，左侧显示空屏页码 -->
            <span
              class="page-number"
              v-if="
                [1, 2].includes(comicMode) &&
                mode[0] === 'paging' &&
                mode[1] === 'double' &&
                !amend &&
                currentPage === 1
              "
            >
              -
            </span>
            <!-- 日漫、翻页模式、双页模式、当前为尾页且不为第一页时，左侧显示空屏页码 -->
            <span
              class="page-number"
              v-if="
                comicMode === 3 &&
                mode[0] === 'paging' &&
                mode[1] === 'double' &&
                currentPage === contentImgList.length &&
                currentPage !== 1
              "
            >
              -
            </span>
            <!-- 日漫、翻页模式、双页模式、跨页匹配或非跨页匹配且当前不为首页时，左侧显示下一页页码 -->
            <span
              class="page-number"
              v-if="
                comicMode === 3 &&
                mode[0] === 'paging' &&
                mode[1] === 'double' &&
                (amend || (!amend && currentPage !== 1)) &&
                currentPage + 1 <= contentImgList.length
              "
            >
              {{ currentPage + 1 }}
            </span>
            <!-- 当前页页码 -->
            <span class="page-number">{{ currentPage }}</span>
            <!-- 条漫/页漫、翻页模式、双页模式、跨页匹配或非跨页匹配且当前不为首页时，左侧显示下一页页码 -->
            <span
              class="page-number"
              v-if="
                [1, 2].includes(comicMode) &&
                mode[0] === 'paging' &&
                mode[1] === 'double' &&
                (amend || (!amend && currentPage !== 1)) &&
                currentPage + 1 <= contentImgList.length
              "
            >
              {{ currentPage + 1 }}
            </span>
            <!-- 条漫/页漫、翻页模式、双页模式、当前为尾页且不为第一页时，右侧显示空屏页码 -->
            <span
              class="page-number"
              v-if="
                [1, 2].includes(comicMode) &&
                mode[0] === 'paging' &&
                mode[1] === 'double' &&
                currentPage === contentImgList.length &&
                currentPage !== 1
              "
            >
              -
            </span>
            <!-- 日漫、翻页模式、双页模式、非跨页匹配、当前为首页时，右侧显示空屏页码 -->
            <span
              class="page-number"
              v-if="
                comicMode === 3 &&
                mode[0] === 'paging' &&
                mode[1] === 'double' &&
                !amend &&
                currentPage === 1
              "
            >
              -
            </span>
            <!-- 翻页模式、双页模式时，显示跨页匹配按钮 -->
            <div
              class="amend ghost-btn"
              @click="changeAmend(!amend)"
              v-if="mode[0] === 'paging' && mode[1] === 'double'"
            >
              更改跨页匹配
            </div>
          </div>

          <!-- 跳转 | （上&下）一话 -->
          <div class="jumper">
            <div
              v-if="comicInfo.collectionList?.length && currentSortID !== 1"
              class="jump-chapter ghost-btn"
              @click="previousChapter()"
            >
              上一话
            </div>
            <input class="page-number" v-model="jumpPage" @keyup.enter="jump()" />
            <div class="page-total">/ {{ contentImgList.length }}</div>
            <div class="jump ghost-btn" @click="jump()">跳转</div>
            <div
              v-if="comicInfo.collectionList?.length && currentSortID !== collectionTotal"
              class="jump-chapter ghost-btn"
              @click="nextChapter()"
            >
              下一话
            </div>
          </div>

          <!-- 阅读模式 -->
          <div class="mode ghost-btn" @click="modeMenuShow = !modeMenuShow">
            <i class="freelog fl-icon-shujia1" />
            阅读模式
          </div>

          <div
            class="mode-menu"
            @mouseenter="changeBarShow(true)"
            @mouseleave="changeBarShow(false)"
            v-show="modeMenuShow && barShow"
          >
            <div
              class="group"
              v-for="(group, index) in mode[0] === 'paging' ? modeMenu : [modeMenu[0]]"
              :key="group.title"
            >
              <div class="title">{{ group.title }}</div>
              <div class="btns">
                <div
                  class="btn"
                  :class="{ active: mode.includes(btn.value) }"
                  @click="changeMode(btn.value, index)"
                  v-for="btn in group.btns"
                  :key="btn.value"
                >
                  {{ btn.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="paging-tip" v-if="directionTipShow">
        <img
          class="img"
          :src="
            require(`../assets/images/${
              mode[2] === 'normal' ? 'left-to-right' : 'right-to-left'
            }.png`)
          "
        />
        <div class="desc">当前翻页方向</div>
        <div class="direction">{{ mode[2] === "normal" ? "从左向右" : "从右向左" }}</div>
      </div>
    </template>

    <!-- mobile & PC 目录弹窗 -->
    <teleport to="#modal">
      <transition name="fade">
        <div
          id="modal"
          class="catalogue-modal"
          @click="catalogueModal = false"
          v-if="catalogueModal"
        ></div>
      </transition>
    </teleport>
    <teleport to="#modal">
      <transition :name="inMobile ? 'slide-right' : 'slide-left'">
        <div
          id="catalogue-box-body"
          class="catalogue-box-body"
          :class="!inMobile && 'pc'"
          v-if="catalogueModal"
        >
          <div class="title-wrapper">
            <span class="title">{{ comicInfo.exhibitTitle }}</span>
            <div class="close-btn" @click="catalogueModal = false">
              <i class="freelog fl-icon-guanbi"></i>
            </div>
          </div>

          <div class="sort" @click="handleSort" v-if="inMobile">
            <span>{{ sortOrder === "asc" ? "正序" : "倒序" }}</span>
            <span class="triangle" :class="sortOrder === 'asc' ? 'asc' : 'desc'"></span>
          </div>

          <div class="sub-catalogue-wrapper" id="sub-catalogue-wrapper">
            <div
              class="sub"
              :class="`${item.itemId === query.subId && 'selected'}`"
              v-for="item in comicInfo.collectionList"
              :key="item.itemId"
              @click="
                currentPage = 1;
                jumpPage = 1;
                setCatalogueModal();
                switchPage('/reader', {
                  id: comicInfo?.exhibitId,
                  collection: true,
                  subId: item.itemId
                });
              "
            >
              <span class="sub-title">{{ item.itemTitle }}</span>
              <img
                v-if="item.articleInfo.status === 2"
                class="freeze-lock"
                src="@/assets/images/freeze.png"
                alt="封禁"
              />
              <div v-else-if="comicInfo.onlineStatus === 0" class="offline-lock">已下架</div>
              <img
                v-else-if="![0, 4].includes(item.defaulterIdentityType)"
                class="auth-lock"
                src="@/assets/images/auth-link-abnormal.png"
                alt="授权链异常"
              />
              <img
                v-else-if="item.defaulterIdentityType === 4"
                class="sub-lock"
                src="@/assets/images/mini-lock.png"
                alt="未授权"
              />
              <img v-else src="@/assets/images/right-arrow.png" />
            </div>

            <div class="tip no-more" v-if="comicInfo?.collectionList?.length === collectionTotal">
              — 已加载全部章节 —
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script lang="tsx">
import {
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  reactive,
  watch,
  computed,
  onBeforeMount,
  ref
} from "vue";
import { useStore } from "vuex";
import { Swipe, SwipeItem } from "vant";
import { toRefs } from "@vue/reactivity";
import { WidgetController, freelogApp } from "freelog-runtime";
import { useMyRouter, useMyScroll, useMyShelf } from "@/utils/hooks";
import { CollectionList, ContentImage, ExhibitItem } from "@/api/interface";
import { State } from "@/store/index";
import "vant/lib/index.css";

export default {
  name: "reader",

  components: {
    "reader-header": defineAsyncComponent(() => import("../components/reader-header.vue")),
    "operate-btn": defineAsyncComponent(() => import("../components/operate-btn.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    "back-top": defineAsyncComponent(() => import("../components/back-top.vue")),
    "my-swipe": Swipe,
    "my-swipe-item": SwipeItem
  },

  setup() {
    type modeType = "paging" | "scroll" | "single" | "double" | "normal" | "manga";

    const myTheme = localStorage.getItem("theme") || "light";
    const store = useStore<State>();
    const { query, switchPage, replacePage } = useMyRouter();
    const { id, collection, subId } = query.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const { scrollTo, scrollTop, clientHeight } = useMyScroll();

    /** 阅读模式菜单 */
    const modeMenu: { title: string; btns: { label: string; value: modeType }[] }[] = [
      {
        title: "阅读模式",
        btns: [
          { label: "翻页", value: "paging" },
          { label: "滚动", value: "scroll" }
        ]
      },
      {
        title: "页面模式",
        btns: [
          { label: "单页", value: "single" },
          { label: "双页", value: "double" }
        ]
      },
      {
        title: "翻页方向",
        btns: [
          { label: "普通模式", value: "normal" },
          { label: "日漫模式", value: "manga" }
        ]
      }
    ];

    let barShowTimer: any = null;
    let tipTimer: any = null;

    const data = reactive({
      loading: false,
      comicInfo: {} as ExhibitItem,
      contentImgList: [] as ContentImage[],
      mobilePagingList: [] as ContentImage[],
      pagePointList: [] as number[],
      swipeIndex: 0,
      totalHeight: 0,
      comicMode: 0,
      currentPage: 1,
      currentUrl: "",
      nextUrl: "",
      jumpPage: 1,
      amend: false,
      theme: myTheme,
      mode: ["paging", "double", "normal"],
      modeMenuShow: false,
      directionTipShow: false,
      barShow: false,
      jumping: false,
      shareWidget: null as WidgetController | null,
      catalogueModal: false,
      collectionCurrent: 0,
      collectionTotal: 0,
      collectionSubId: "",
      recommendList: [] as ExhibitItem[]
    });
    const sortOrder = ref<string>("asc"); // 默认排序为正序

    const methods = {
      /** 点击页面 */
      clickPage() {
        this.setShareWidgetShow(false);
        if (store.state.inMobile) {
          data.barShow = !data.barShow;
          if (data.modeMenuShow) data.modeMenuShow = false;
        }
      },

      /** PC 端改变 header 与 footer 显示状态 */
      changeBarShow(show: boolean) {
        if (barShowTimer) {
          clearTimeout(barShowTimer);
          barShowTimer = null;
        }
        if (show) {
          data.barShow = true;
        } else {
          barShowTimer = setTimeout(() => {
            data.barShow = false;
            data.modeMenuShow = false;
          }, 3000);
        }
      },

      /** 切换主题模式 */
      setTheme() {
        data.theme = data.theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", data.theme);
      },

      /** 控制目录弹窗 */
      setCatalogueModal() {
        data.catalogueModal = !data.catalogueModal;
      },

      /** 获取授权 */
      async getAuth() {
        const authResult = await freelogApp.addAuth(id, { immediate: true });
        const { status } = authResult;
        if (status === 0) {
          getContent();
          refreshAuth();
        }
      },

      /** 切换阅读模式 */
      changeMode(value: modeType, index: number) {
        const { inMobile } = store.state;

        if (inMobile && index === 2 && data.mode[0] !== "paging") {
          // 移动端，选择页面模式或翻页方向时，如果当前阅读模式不为翻页模式，则自动切换为翻页模式
          data.mode[0] = "paging";
        } else if (inMobile && index === 0) {
          // 移动端，选择阅读模式时，清空翻页模式选择
          data.mode[2] = "";
        }

        if (data.mode.includes(value)) return;

        data.mode[index] = value;

        if (data.mode[0] === "paging") {
          if (inMobile) {
            dealListInPagingMobile();
          } else {
            this.jump();
          }
          // 页漫时，将选择的模式保存在本地
          // localStorage.setItem("comicReadMode", JSON.stringify(data.mode));
        } else if (value === "scroll") {
          this.getPointInScroll();
        }

        if (index === 2 && !inMobile) {
          this.showDirectionTip();
        }

        // 保存模式
        handleLastViewedMode(id);
      },

      /** 显示翻页方向提示 */
      showDirectionTip() {
        if (tipTimer) {
          clearTimeout(tipTimer);
          data.directionTipShow = false;
        }

        setTimeout(() => {
          data.directionTipShow = true;
          tipTimer = setTimeout(() => {
            data.directionTipShow = false;
            tipTimer = null;
          }, 1600);
        }, 50);
      },

      /** 左侧切换页面 */
      leftSwitchPage() {
        data.mode[2] === "normal" ? this.pageForward() : this.pageBackward();
      },

      /** 右侧切换页面 */
      rightSwitchPage() {
        data.mode[2] === "normal" ? this.pageBackward() : this.pageForward();
      },

      /** 向前翻页 */
      pageForward() {
        const pageType = data.mode[1];
        let offset = pageType === "single" ? 1 : 2;
        if (!data.amend && pageType === "double" && data.currentPage === 2) {
          // 非跨页匹配、双页模式、当前页为第二页时，仅向前一页
          offset = 1;
        }
        const page = data.currentPage - offset;
        if (page < 1) return;
        data.currentPage = page;
        data.jumpPage = page;
      },

      /** 向后翻页 */
      pageBackward() {
        const pageType = data.mode[1];
        let offset = pageType === "single" ? 1 : 2;
        if (!data.amend && pageType === "double" && data.currentPage === 1) {
          // 非跨页匹配、双页模式、当前页为第一页时，仅向后一页
          offset = 1;
        }
        const page = data.currentPage + offset;
        if (page > data.contentImgList.length) return;
        data.currentPage = page;
        data.jumpPage = page;
      },

      /** 更改跨页匹配 */
      changeAmend(value: boolean) {
        let page;
        if (data.currentPage === 1) {
          page = 1;
          data.nextUrl = data.contentImgList[1].url;
        } else if (value) {
          page =
            data.currentPage === data.contentImgList.length
              ? data.currentPage - 1
              : data.currentPage + 1;
        } else {
          page = data.currentPage - 1;
        }
        data.currentPage = page;
        data.jumpPage = page;
        data.amend = value;
      },

      /** 移动端划动翻页 */
      swipePage(index: number) {
        const pagingType = data.mode[2];
        let page = index + 1;
        if (pagingType === "manga") page = data.mobilePagingList.length - index;
        data.currentPage = page;
        data.jumpPage = page;
      },

      // 上一话
      previousChapter() {
        data.currentPage = 1;
        data.jumpPage = 1;
        const { collectionList } = data.comicInfo;

        const preSubID =
          (collection &&
            currentSortID.value !== 0 &&
            collectionList?.filter(i => i.sortId === currentSortID.value - 1)[0]?.itemId) ||
          0;

        replacePage("/reader", {
          id: data.comicInfo?.exhibitId,
          collection: true,
          subId: preSubID
        });
      },

      // 下一话
      async nextChapter() {
        data.currentPage = 1;
        data.jumpPage = 1;
        const { collectionList } = data.comicInfo;

        const nextSubID =
          (collection &&
            currentSortID.value !== data.collectionTotal &&
            collectionList?.filter(i => i.sortId === currentSortID.value + 1)[0]?.itemId) ||
          0;

        replacePage("/reader", {
          id: data.comicInfo?.exhibitId,
          collection: true,
          subId: nextSubID
        });
      },

      /** 跳转 */
      jump() {
        let jumpPageNum = Number(String(data.jumpPage).replace(/[^0-9]/g, ""));
        if (jumpPageNum < 1) {
          jumpPageNum = 1;
        } else if (jumpPageNum > data.contentImgList.length) {
          jumpPageNum = data.contentImgList.length;
        }
        let page = jumpPageNum;

        if (data.mode[0] === "paging" && data.mode[1] === "double") {
          // 翻页模式、双页模式下，需对跳转页码进行修正
          if (page === 1) {
            data.currentPage = page;
            data.jumpPage = page;
            return;
          } else if (data.amend) {
            // 跨页匹配时，页码显示双页的奇数页码
            page = jumpPageNum % 2 ? jumpPageNum : jumpPageNum - 1;
          } else {
            // 非跨页匹配时，页码显示双页的偶数页码
            page = jumpPageNum % 2 ? jumpPageNum - 1 : jumpPageNum;
          }
        } else if (data.mode[0] === "scroll") {
          data.jumping = true;
          nextTick(() => {
            scrollTo(data.pagePointList[page - 1], "auto");
            setTimeout(() => {
              data.jumping = false;
            }, 50);
          });
        }
        data.currentPage = page;
        data.jumpPage = page;

        if (store.state.inMobile && data.mode[0] === "paging") {
          data.loading = true;
          const index = data.mode[2] === "normal" ? page - 1 : data.mobilePagingList.length - page;
          nextTick(() => {
            data.swipeIndex = index;
            data.loading = false;
          });
        }
      },

      /** 滚动模式下获取每页的位置 */
      getPointInScroll() {
        data.pagePointList = [];
        data.totalHeight = 0;
        let WIDTH = 1000;
        if (store.state.inMobile) {
          const app = document.getElementById("app");
          WIDTH = app?.clientWidth || 0;
        }
        data.contentImgList.forEach(item => {
          data.pagePointList.push(data.totalHeight);
          const { width, height } = item;
          const currentHeight = (WIDTH / width) * height;
          item.width = WIDTH;
          item.height = currentHeight;
          data.totalHeight += currentHeight;
        });
        this.jump();
      },

      /** 控制分享弹窗显示 */
      setShareWidgetShow(value: boolean) {
        data.shareWidget?.setData({ show: value });
      },

      /** 跳转详情 */
      toDetailFromRecommend(exhibitId: string) {
        switchPage("/detail", {
          id: exhibitId
        });
      },

      /** 搜索标签 */
      searchTag(tag: string) {
        const query: { tags: string } = { tags: tag };
        switchPage("/home", query);
      },

      /**
       * 切换正序，倒序
       */
      handleSort() {
        // 切换排序顺序
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";

        // 使用排序函数
        const compare = (a: any, b: any) => {
          return sortOrder.value === "asc" ? a.sortId - b.sortId : b.sortId - a.sortId;
        };

        // 根据当前排序顺序更新数据
        data.comicInfo.collectionList?.sort(compare);
      }
    };

    /** 获取漫画信息 */
    const getComicInfo = async () => {
      const exhibitInfo = await freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 });
      let comicMode;
      const { resourceType, articleType } = exhibitInfo.data.data.articleInfo;
      data.comicInfo = exhibitInfo.data.data;

      if (resourceType[2] === "条漫") {
        comicMode = 1;
      } else if (resourceType[2] === "日漫") {
        comicMode = 3;
      } else {
        comicMode = 2;
      }

      // 合集逻辑
      if (articleType === 2) {
        getCollectionList(true);

        sortOrder.value =
          (exhibitInfo.data.data.versionInfo?.exhibitProperty?.catalogueProperty as any)
            ?.collection_sort_list === "collection_sort_descending"
            ? "desc"
            : "asc";

        const subInfoResponse = await (freelogApp as any).getCollectionSubInfo(id, {
          itemId: subId
        });
        const { resourceType } = subInfoResponse.data.data.articleInfo;
        data.comicInfo = { ...data.comicInfo, articleInfo: subInfoResponse.data.data.articleInfo };

        if (resourceType[2] === "条漫") {
          comicMode = 1;
        } else if (resourceType[2] === "日漫") {
          comicMode = 3;
        } else {
          comicMode = 2;
        }
      }

      data.comicInfo = {
        ...data.comicInfo,
        comicMode
      };
      data.comicMode = comicMode;
      getContent();
      getRecommendList();
    };

    /** 获取漫画目录 */
    const getCollectionList = async (init = false) => {
      try {
        const { collectionList } = data.comicInfo;
        if (!init && collectionList && collectionList?.length >= data.collectionTotal) {
          return;
        }

        data.collectionCurrent = init ? 0 : data.collectionCurrent + 1000;

        const subList = await (freelogApp as any).getCollectionSubList(id, {
          skip: data.collectionCurrent,
          limit: 1000
        });
        const { dataList, totalItem } = subList.data.data;
        data.collectionTotal = totalItem;

        if (dataList.length !== 0) {
          const ids = dataList.map((item: any) => item.itemId).join();
          const statusInfo = await (freelogApp as any).getCollectionSubAuth(id, { itemIds: ids });
          if (statusInfo.data.data) {
            (dataList as CollectionList[]).forEach(item => {
              const index = statusInfo.data.data.findIndex(
                (resultItem: { itemId: string }) => resultItem.itemId === item.itemId
              );
              if (index !== -1) {
                item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
              }
            });
          }

          data.comicInfo.collectionList = collectionList
            ? [...collectionList, ...dataList]
            : [...dataList];
        }

        // 递归循环加载所有单品
        if (
          data.comicInfo.collectionList &&
          data.comicInfo.collectionList?.length < data.collectionTotal
        ) {
          getCollectionList();
        }
      } catch (error) {
        console.error("Failed to get collection list", error);
      }
    };

    /** 获取漫画内容 */
    const getContent = async (updateSubId?: string) => {
      data.loading = true;
      const statusInfo = collection
        ? await (freelogApp as any).getCollectionSubAuth(id, { itemIds: updateSubId || subId })
        : await freelogApp.getExhibitAuthStatus(id);

      if (statusInfo.data.data) {
        data.comicInfo.defaulterIdentityType = statusInfo.data.data[0].defaulterIdentityType;
      }

      if (data.comicInfo.defaulterIdentityType === 0) {
        // 已签约并且授权链无异常
        const info = collection
          ? await (freelogApp as any).getCollectionSubFileStream(id, {
              itemId: updateSubId || subId,
              subFilePath: "index.json"
            })
          : await freelogApp.getExhibitFileStream(id, { subFilePath: "index.json" });
        if (info?.status !== 200 || info.data.list.length === 0) {
          data.loading = false;
          mountShareWidget();
          return;
        }

        const requestList: Promise<any>[] = [];
        info.data.list.forEach((item: ContentImage) => {
          const request = collection
            ? (freelogApp as any).getCollectionSubFileStream(id, {
                itemId: updateSubId || subId,
                subFilePath: item.name,
                returnUrl: true
              })
            : freelogApp.getExhibitFileStream(id, {
                subFilePath: item.name,
                returnUrl: true
              });

          requestList.push(request);
        });
        const results = await Promise.all([...requestList]);
        info.data.list.forEach((item: ContentImage, index: number) => {
          item.url = results[index];
        });

        data.contentImgList = info.data.list;
        data.currentUrl = data.contentImgList[0].url;
        window.addEventListener("keyup", keyup);
      } else if (data.comicInfo.defaulterIdentityType === 4) {
        // 标的物未签约，自动弹出授权弹窗
        methods.getAuth();
      }

      data.loading = false;
      mountShareWidget();

      if (data.comicMode === 1) {
        const res = await freelogApp.getUserData("comicLastViewedMode");
        const lastViewed = res?.data?.data || [];
        const index = lastViewed.findIndex((i: { id: string }) => i.id === id);
        const comicReadMode = lastViewed[index]?.mode;

        if (comicReadMode) {
          data.mode = comicReadMode;
        } else {
          // 条漫时，自动选择滚动模式
          methods.changeMode("scroll", 0);
        }
        // 条漫时，自动选择滚动模式
        // methods.changeMode("scroll", 0);
        methods.getPointInScroll();
      } else if ([2, 3].includes(data.comicMode)) {
        const res = await freelogApp.getUserData("comicLastViewedMode");
        const lastViewed = res?.data?.data || [];
        const index = lastViewed.findIndex((i: { id: string }) => i.id === id);
        const comicReadMode = lastViewed[index]?.mode;

        // 页漫/日漫时，自动选择翻页模式（如本地有记录翻页模式的选择，优先取本地记录的模式）
        // const comicReadMode = localStorage.getItem("comicReadMode");
        if (comicReadMode) data.mode = comicReadMode;
        if (comicReadMode[0] === "scroll") {
          methods.getPointInScroll();
        }
        // 移动端翻页模式下处理图片顺序
        if (store.state.inMobile) dealListInPagingMobile();
      }
    };

    /** 获取推荐列表 */
    const getRecommendList = async () => {
      const res = await (freelogApp as any).getExhibitRecommend(id, {
        recommendNorm: "sameAuthorAndType,sameTagAndType,sameType,latestCreate",
        size: 10
      });
      const { data: recommendData } = res.data;

      if (recommendData.length !== 0) {
        data.recommendList = recommendData;
      }
    };

    /** 移动端翻页模式下处理图片顺序 */
    const dealListInPagingMobile = () => {
      data.loading = true;
      const pagingType = data.mode[2];
      let currentIndex = 0;
      if (pagingType === "normal") {
        // 普通模式下（从左向右）
        data.mobilePagingList = [
          ...data.contentImgList,
          ...(data.recommendList.length && (currentSortID.value === data.collectionTotal || !subId)
            ? [{ name: "RecommendFakeUrl", size: 0, url: "RecommendFakeUrl", width: 0, height: 0 }]
            : [])
        ];

        currentIndex = data.currentPage - 1;
      } else if (pagingType === "manga") {
        // 日漫模式下（从右向左）
        data.mobilePagingList = [
          ...data.contentImgList,
          ...(data.recommendList.length && (currentSortID.value === data.collectionTotal || !subId)
            ? [{ name: "RecommendFakeUrl", size: 0, url: "RecommendFakeUrl", width: 0, height: 0 }]
            : [])
        ].reverse();
        currentIndex = data.mobilePagingList.length - data.currentPage;
      }
      nextTick(() => {
        data.swipeIndex = currentIndex;
        data.loading = false;
      });
    };

    /** 刷新授权状态 */
    const refreshAuth = () => {
      const { authIds, myShelf } = store.state;
      authIds.push(id);
      store.commit("setData", { key: "authIds", value: authIds });
      const index = myShelf?.findIndex((item: ExhibitItem) => item.exhibitId === id) as number;
      if (index !== -1 && myShelf) {
        myShelf[index].defaulterIdentityType = 0;
        store.commit("setData", { key: "myShelf", value: myShelf });
      }
    };

    /** 快捷键 */
    const keyup = (e: any) => {
      const { target } = e;
      if (target && target.nodeName === "INPUT") return;

      if (e.key === "ArrowLeft") {
        methods.leftSwitchPage();
      } else if (e.key === "ArrowRight") {
        methods.rightSwitchPage();
      }
    };

    /** 加载分享插件 */
    const mountShareWidget = async () => {
      if (store.state.inMobile) return;

      if (data.shareWidget) await data.shareWidget.unmount();

      const subDeps = await freelogApp.getSelfDependencyTree();
      const widgetData = subDeps.find(item => item.articleName === "ZhuC/Freelog插件-展品分享");
      if (!widgetData) return;

      const { articleId, parentNid, nid } = widgetData;
      const topExhibitId = freelogApp.getTopExhibitId();

      const params = {
        articleId,
        parentNid,
        nid,
        topExhibitId,
        container: document.getElementById("share") as HTMLElement,
        renderWidgetOptions: {
          data: {
            exhibit: {
              ...data.comicInfo,
              itemId: query.value.subId,
              collection: query.value.collection
            },
            type: "漫画",
            routerType: "reader"
          }
        }
        // widget_entry: "https://localhost:8201"
      };
      data.shareWidget = await freelogApp.mountArticleWidget(params);
    };

    // 获取单品详细信息
    const getCollectionInfo = async (subId?: string) => {
      const res = await (freelogApp as any).getCollectionSubInfo(id, { itemId: subId });
      data.comicInfo = { ...data.comicInfo, articleInfo: res.data.data.articleInfo };
    };

    watch(
      () => scrollTop.value,
      cur => {
        if (data.mode[0] !== "scroll") return;

        if (data.barShow && !data.jumping) {
          clearTimeout(barShowTimer);
          barShowTimer = null;
          data.barShow = false;
          if (data.modeMenuShow) data.modeMenuShow = false;
        }

        const height = clientHeight.value || 0;
        const offset = height * 0.3;
        let page = 1;
        for (let i = 0; i < data.pagePointList.length; i++) {
          if (cur + offset >= data.pagePointList[i]) {
            page = i + 1;
          } else {
            break;
          }
        }
        if (page !== data.currentPage) {
          data.currentPage = page;
          data.jumpPage = page;
        }
      }
    );

    watch(
      () => data.currentPage,
      cur => {
        data.currentUrl = "";
        data.nextUrl = "";
        const { contentImgList } = data;
        nextTick(() => {
          data.currentUrl = contentImgList[cur - 1]?.url || "";
          if (contentImgList[cur]) {
            data.nextUrl = contentImgList[cur]?.url || "";
          }
        });
      }
    );

    // 监听单品id，更新单品详情
    watch(
      () => query.value.subId,
      cur => {
        if (query.value.subId) {
          getContent(cur);
          getCollectionInfo(cur);
          data.collectionSubId = cur;
        }
      },
      {
        immediate: true
      }
    );

    // 监听目录弹窗的滚动
    watch(
      () => data.catalogueModal,
      cur => {
        if (!cur) {
          return;
        }
        nextTick(() => {
          const {
            scrollTop: modalScrollTop,
            clientHeight: modalClientHeight,
            scrollHeight: modalScrollHeight
          } = useMyScroll("catalogue-box-body");

          if (modalScrollTop.value + modalClientHeight.value === modalScrollHeight.value) {
            getCollectionList();
          }
        });
      }
    );

    const currentSortID = computed(() => {
      const currentSubID = query.value.subId;
      const filterData = data.comicInfo.collectionList?.filter(
        i => i.itemId === currentSubID
      ) as CollectionList[];

      const targetID = filterData?.length && filterData[0].sortId;

      return targetID;
    });

    // 记录上一次阅读记录
    const handleLastViewedHistory = async (data: { id: string; subId: string }) => {
      const lastViewedResponse = await freelogApp.getUserData("comicLastViewedHistory");
      const lastViewed = lastViewedResponse?.data?.data || [];

      if (!lastViewed?.length) {
        lastViewed.push({ id: data.id, subId: data.subId });
        freelogApp.setUserData("comicLastViewedHistory", lastViewed);
        return;
      }

      const index = lastViewed.findIndex((i: { id: string }) => i.id === data.id);

      if (index !== -1) {
        // 如果找到相同的数据，则替换它
        lastViewed[index] = { id: data.id, subId: data.subId };
      } else {
        // 如果没有找到相同的数据，则新增一条记录
        lastViewed.push({ id: data.id, subId: data.subId });
      }

      freelogApp.setUserData("comicLastViewedHistory", lastViewed);
    };

    // 记录上一次阅读模式
    const handleLastViewedMode = async (id: string) => {
      const lastViewedResponse = await freelogApp.getUserData("comicLastViewedMode");
      const lastViewed = lastViewedResponse?.data?.data || [];

      if (!lastViewed?.length) {
        lastViewed.push({ id, mode: data.mode });
        freelogApp.setUserData("comicLastViewedMode", lastViewed);
        return;
      }

      const index = lastViewed.findIndex((item: { id: string }) => item.id === id);

      if (index !== -1) {
        // 如果找到相同的数据，则替换它
        lastViewed[index] = { id, mode: data.mode };
      } else {
        // 如果没有找到相同的数据，则新增一条记录
        lastViewed.push({ id, mode: data.mode });
      }

      freelogApp.setUserData("comicLastViewedMode", lastViewed);
    };

    onBeforeMount(() => {
      getComicInfo();
    });

    onBeforeUnmount(async () => {
      if (barShowTimer) {
        clearTimeout(barShowTimer);
        barShowTimer = null;
      }
      if (tipTimer) {
        clearTimeout(tipTimer);
        tipTimer = null;
      }
      handleLastViewedHistory({ id, subId: data.collectionSubId });
      handleLastViewedMode(id);
      window.removeEventListener("keyup", keyup);
      await data.shareWidget?.unmount();
    });

    return {
      ...toRefs(store.state),
      switchPage,
      isCollected,
      operateShelf,
      modeMenu,
      ...toRefs(data),
      ...methods,
      currentSortID,
      query,
      sortOrder
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/reader";
</style>
