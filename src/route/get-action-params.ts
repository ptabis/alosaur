import { getCookies } from "../deps.ts";
import { RouteMetadata } from "../metadata/route.ts";
import {
  TransformBodyOption,
  TransformConfigMap,
} from "../models/transform-config.ts";
import { HttpContext } from "../models/http-context.ts";
import { RequestBodyParseOptions } from "../models/request.ts";
import { Context } from "../models/context.ts";

type ArgumentValue = any;

/** Gets route action params */
export async function getActionParams<T>(
  context: HttpContext<T>,
  route: RouteMetadata,
  transformConfigMap?: TransformConfigMap,
): Promise<ArgumentValue[]> {
  if (route.params.length == 0) {
    return [];
  }

  const args: ArgumentValue[] = [];
  const params = route.params.sort((a, b) => a.index - b.index);

  // fill params to resolve
  for (let i = 0; i < params.length; i++) {
    const param = params[i];

    switch (param.type) {
      case "query":
        const queryParams = getQueryParams(context.request.url);

        if (queryParams && param.name) {
          const paramsArgs = queryParams.get(param.name);
          args.push(paramsArgs ? paramsArgs : undefined);
        } else {
          args.push(undefined);
        }
        break;

      case "query-obj":
        const queryParams2 = getQueryParams(context.request.url);
        if (queryParams2) {
          const paramsObj = Object.fromEntries(queryParams2.entries());
          args.push(Object.keys(paramsObj).length > 0 ? paramsObj : undefined);
        }
        break;

      case "cookie":
        if (param.name) {
          const cookies =
            getCookies(context.request.serverRequest.request.headers) ||
            {};
          args.push(cookies[param.name]);
        } else {
          args.push(undefined);
        }
        break;

      case "body":
        args.push(
          await getTransformedParam(
            context,
            {
              transform: param.transform,
              type: param.type,
              config: transformConfigMap,
            },
            param.bodyParseOptions,
          ),
        );
        break;

      case "request":
        args.push(context.request);
        break;

      case "response":
        args.push(context.response);
        break;

      case "context":
        args.push(context);
        break;

      case "route-param":
        if (route.routeParams && param.name) {
          args.push(route.routeParams[param.name]);
        } else {
          args.push(undefined);
        }
        break;

      default:
        args.push(undefined);
        break;
    }
  }
  return args;
}

/**
 * Gets microservice action params
 * Supported only '@Ctx' and '@Body'
 */
export async function getMsActionParams<T>(
  context: Context<T>,
  route: RouteMetadata,
  body: any,
): Promise<ArgumentValue[]> {
  if (route.params.length == 0) {
    return [];
  }

  const args: ArgumentValue[] = [];
  const params = route.params.sort((a, b) => a.index - b.index);

  // fill params to resolve
  for (let i = 0; i < params.length; i++) {
    const param = params[i];

    switch (param.type) {
      case "body":
        args.push(body);
        break;

      case "context":
        args.push(context);
        break;

      default:
        args.push(undefined);
        break;
    }
  }
  return args;
}

/** Gets URL query params */
export function getQueryParams(url: string): URLSearchParams | undefined {
  const params = url.split("?")[1];

  if (!params) return undefined;

  return new URLSearchParams(params);
}

async function getTransformedParam(
  context: HttpContext,
  transformBodyOption: TransformBodyOption,
  bodyParseOptions?: RequestBodyParseOptions,
): Promise<any> {
  const body = await context.request.body(bodyParseOptions);

  const { config, transform, type } = transformBodyOption;

  if (config !== undefined && transform !== undefined) {
    const globalTransform = config.get(type);

    if (globalTransform) {
      return globalTransform.getTransform(transform, body);
    }
  }

  if (transform) {
    return transform(body);
  }

  return body;
}
