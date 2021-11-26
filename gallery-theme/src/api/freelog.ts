const MyWindow: any = window;

// 获取展品列表请求参数
export interface GetExhibitsListParams {
  skip: string; // 从第几个开始
  limit: string; // 取多少个
  resourceType: string; // 资源类型
  omitResourceType: string; // 过滤资源类型
  tags: string; // 展品和资源标签，多个使用","隔开
  projection: string;
  keywords: string;
  isLoadVersionProperty: string; // 是否加载版本
}

// 获取展品信息请求参数
export interface GetExhibitsInfoParams {
  projection?: string; // 需要指定哪些字段
  isLoadVersionProperty?: 0 | 1; // 是否需要展品版本属性
  isLoadCustomPropertyDescriptors?: 0 | 1; // 是否加载自定义属性信息
  isLoadResourceDetailInfo?: 0 | 1; // 是否加载资源详细信息(额外查询了资源的封面,标签,简介等)
  isLoadResourceVersionInfo?: 0 | 1; // 	是否加载资源版本信息(额外查询了资源版本的描述,创建日期,更新日期等)
}

/**
 * 获取展品列表
 * @param query Partial<GetExhibitsListParams>
 */
export const getExhibitsList = (query: Partial<GetExhibitsListParams>) => {
  return MyWindow.freelogApp.getPresentablesPaging(query);
};

/**
 * 获取展品授权状态
 * @param ids 查询的展品id（多个以逗号拼接）
 */
export const getExhibitsAuth = (ids: string) => {
  return MyWindow.freelogApp.getPresentablesAuth(ids);
};

/**
 * 获取展品信息
 * @param id 展品id
 * @param query 获取展品列表请求参数
 */
export const getExhibitsInfo = (id: string, query: GetExhibitsInfoParams) => {
  return MyWindow.freelogApp.getPresentableDetailById(id, query);
};

/**
 * 获取资源信息
 * @param id 资源id
 */
export const getResourceInfo = async (id: string) => {
  return await MyWindow.freelogApp.getResourceInfoById(id);
};

/**
 * 获取资源文件信息
 * @param presentableId 展品id
 * @param returnUrl 是否只返回url，例如img标签图片只需要url
 * @param config axios的config 目前仅支持"onUploadProgress", "onDownloadProgress", "responseType"
 */
export const getFileInfo = async (presentableId: string, returnUrl?: boolean, config?: any) => {
  return await MyWindow.freelogApp.getFileStreamById(presentableId, returnUrl, config);
};

/**
 * 获取信息（展品、资源、文件）
 * @param type 请求的信息类型（对应接口名）
 * @param query 请求参数（按照对应接口的参数顺序，第一位是展品id）
 * @param errorCallback 授权失败回调
 */
export const getInfo = async (type: string, query: any[], errorCallback?: () => void) => {
  let info = await MyWindow.freelogApp[type](...query);
  if (typeof info === "string" || info.data.errCode === 0) return info;

  // 提交给运行时处理授权
  return new Promise((resolve) => {
    MyWindow.freelogApp.addAuth(
      query[0],
      async () => {
        info = await MyWindow.freelogApp[type](...query);
        resolve(info);
      },
      () => {
        console.error("授权失败");
        errorCallback && errorCallback();
        resolve({ data: { data: {} } });
      },
      { immediate: true }
    );
  });
};

/**
 * 呼出授权
 */
export const callAuth = () => {
  // 当addAuth多个未授权展品且没有立刻呼出（或者存在未授权展品且已经addAuth 但用户关闭了，插件想要用户签约时）可以通过callAuth()唤出
  MyWindow.freelogApp.callAuth();
};

/**
 * 监听登录
 */
export const watchLogin = () => {
  MyWindow.freelogApp.onLogin(() => {
    window.location.reload();
  });
};

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return MyWindow.freelogApp.getCurrentUser();
};

/**
 * 唤起登录弹窗
 */
export const callLogin = async (callback: () => void) => {
  return MyWindow.freelogApp.callLogin(callback);
};
