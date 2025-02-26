import { getPathNameFromUrl } from "../route/route.utils.ts";
import { send } from "../static/send.ts";
import { StaticFilesConfig } from "../models/static-config.ts";
import { HttpContext } from "../models/http-context.ts";

export async function getStaticFile<T>(
  context: HttpContext<T>,
  staticConfig?: StaticFilesConfig,
  showError: boolean = true,
) {
  if (staticConfig == null) {
    return false;
  }

  let url = context.request.url;

  if (staticConfig.baseRoute) {
    const regexpUrl = new RegExp(`^${staticConfig.baseRoute}`);

    if (regexpUrl.test(url)) {
      url = url.replace(regexpUrl, "/");
    } else {
      return false;
    }
  }

  try {
    const filePath = await send(
      {
        request: context.request.serverRequest.request,
        response: context.response,
      },
      getPathNameFromUrl(url),
      staticConfig,
    );

    return !!filePath;
  } catch (error) {
    // TODO: exception
    if (staticConfig.baseRoute && showError) {
      console.warn(error);
    }
    return null;
  }
}
