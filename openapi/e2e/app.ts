import { Controller } from "../../src/decorator/Controller.ts";
import { Get } from "../../src/decorator/Get.ts";
import { Param } from "../../src/decorator/Param.ts";
import { Area } from "../../src/decorator/Area.ts";
import { ProducesResponse } from "../metadata/produces-response.decorator.ts";
import { AppSettings } from "../../src/models/app-settings.ts";
import { Product } from "./models/product.model.ts";
import { Post } from "../../src/decorator/Post.ts";
import { Body } from "../../src/decorator/Body.ts";

/**
 * Standart not found result
 */
export class NotFoundResult {
  status = 200;
  description = "Not found";
}

/**
 * Product controller
 * @summary test
 */
@Controller()
export class ProductController {
  /**
   * Gets product by id
   * @summary action test
   * @remarks Awesomeness!
   * @param {id} The product id
   */
  @Get("/:id")
  @ProducesResponse(
    { code: 200, type: Product, description: "Product founded" },
  )
  @ProducesResponse(
    {
      code: 404,
      type: NotFoundResult,
      description: "Product has missing/invalid values",
    },
  )
  @ProducesResponse(
    { code: 500, description: "Oops! Can't create your product right now" },
  )
  GetById(@Param("id") id: string) {
    return new Product();
  }

  /**
   * Create product
   * @param product
   * @RequestBody application/xml
   * @RequestBody application/json
   */
  @Post("/")
  @ProducesResponse(
    { code: 200, type: Product, description: "Product created" },
  )
  Create(@Body() product: Product) {
  }
}

@Area({
  controllers: [ProductController],
})
export class ProductArea {}

export const ProductAppSettings: AppSettings = {
  areas: [ProductArea],
};
