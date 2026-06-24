const PRODUCT_TITLE = "Custom Dubraes";
const PRODUCT_DESCRIPTION = `
  <p>Custom Small or Medium Premium Dubraes</p>
  <p>Sold by the set (2 pcs)</p>
  <p>Size 1.25 or 1.5 Inches</p>
  <p>Material Finish - Plating / Spraying / Powder Coated</p>
  <p>Material - Metal</p>
`;
const VARIANT_WITHOUT_CUSTOMIZATION = "Dubraes Only";
const VARIANT_WITH_CUSTOMIZATION = "Dubraes with Custom Design";

const toNumericId = (gid) => gid?.split("/").pop() || "";
const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const graphql = async (admin, query, variables = {}) => {
  const response = await admin.graphql(query, { variables });
  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(", "));
  }

  return json.data;
};

const getProductVariants = (product) =>
  product?.variants?.nodes?.map((variant) => ({
    id: variant.id,
    numericId: toNumericId(variant.id),
    title: variant.title,
    option: variant.selectedOptions?.[0]?.value || variant.title,
  })) || [];

const getVariantSearchText = (variant) =>
  normalize(`${variant.title || ""} ${variant.option || ""}`);

const findRequiredVariants = (variants) => {
  const withCustomization =
    variants.find((variant) => {
      const text = getVariantSearchText(variant);
      return (
        text.includes("custom design") ||
        text.includes("with custom") ||
        text.includes("customization") ||
        (text.includes("custom") && !text.includes("only"))
      );
    }) ||
    variants[1] ||
    variants[0];

  const withoutCustomization =
    variants.find((variant) => {
      const text = getVariantSearchText(variant);
      return (
        text.includes("dubraes only") ||
        text.includes("without custom") ||
        text.includes("no custom") ||
        text.includes("only") ||
        !text.includes("custom")
      );
    }) ||
    variants.find((variant) => variant.id !== withCustomization?.id) ||
    variants[0];

  return {
    withoutCustomization,
    withCustomization,
  };
};

const publishProductToSalesChannels = async (admin, productId) => {
  const data = await graphql(
    admin,
    `#graphql
      query GetPublications {
        publications(first: 20) {
          nodes {
            id
            name
          }
        }
      }
    `,
  );

  const publicationInputs = data.publications.nodes.map((publication) => ({
    publicationId: publication.id,
  }));

  if (!publicationInputs.length) return;

  const publishData = await graphql(
    admin,
    `#graphql
      mutation PublishCustomDubraesProduct(
        $id: ID!
        $input: [PublicationInput!]!
      ) {
        publishablePublish(id: $id, input: $input) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      id: productId,
      input: publicationInputs,
    },
  );

  const errors = publishData.publishablePublish.userErrors.filter(
    (error) => !error.message.toLowerCase().includes("already published"),
  );

  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }
};

const allowVariantsToSellWithoutInventory = async (
  admin,
  productId,
  variants,
) => {
  const data = await graphql(
    admin,
    `#graphql
      mutation AllowDubraesVariantsToSellWithoutInventory(
        $productId: ID!
        $variants: [ProductVariantsBulkInput!]!
      ) {
        productVariantsBulkUpdate(
          productId: $productId
          variants: $variants
        ) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      productId,
      variants: variants.map((variant) => ({
        id: variant.id,
        inventoryPolicy: "CONTINUE",
      })),
    },
  );

  const errors = data.productVariantsBulkUpdate.userErrors;
  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }
};

const findCustomDubraesProductByQuery = async (admin, query) => {
  const data = await graphql(
    admin,
    `#graphql
      query FindCustomDubraesProduct($query: String!) {
        products(first: 10, query: $query) {
          nodes {
            id
            title
            handle
            variants(first: 10) {
              nodes {
                id
                title
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `,
    { query },
  );

  return data.products.nodes || [];
};

const findCustomDubraesProduct = async (admin) => {
  const exactMatches = await findCustomDubraesProductByQuery(
    admin,
    `title:'${PRODUCT_TITLE}'`,
  );

  const exactProduct = exactMatches.find(
    (product) => normalize(product.title) === normalize(PRODUCT_TITLE),
  );
  if (exactProduct) return exactProduct;

  const handleMatches = await findCustomDubraesProductByQuery(
    admin,
    "handle:custom-dubraes",
  );
  if (handleMatches[0]) return handleMatches[0];

  const titleMatches = await findCustomDubraesProductByQuery(
    admin,
    "title:Dubraes",
  );

  return (
    titleMatches.find((product) => {
      const title = normalize(product.title);
      return title.includes("custom") && title.includes("dubraes");
    }) || null
  );
};

const createCustomDubraesProduct = async (admin) => {
  const data = await graphql(
    admin,
    `#graphql
      mutation CreateCustomDubraesProduct($input: ProductSetInput!) {
        productSet(input: $input, synchronous: true) {
          product {
            id
            title
            handle
            variants(first: 10) {
              nodes {
                id
                title
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: {
        title: PRODUCT_TITLE,
        descriptionHtml: PRODUCT_DESCRIPTION,
        vendor: "KEEP ME FRESH",
        status: "ACTIVE",
        productOptions: [
          {
            name: "Type",
            position: 1,
            values: [
              { name: VARIANT_WITHOUT_CUSTOMIZATION },
              { name: VARIANT_WITH_CUSTOMIZATION },
            ],
          },
        ],
        variants: [
          {
            price: "5.00",
            inventoryPolicy: "CONTINUE",
            optionValues: [
              {
                optionName: "Type",
                name: VARIANT_WITHOUT_CUSTOMIZATION,
              },
            ],
          },
          {
            price: "5.00",
            inventoryPolicy: "CONTINUE",
            optionValues: [
              {
                optionName: "Type",
                name: VARIANT_WITH_CUSTOMIZATION,
              },
            ],
          },
        ],
      },
    },
  );

  const errors = data.productSet.userErrors;
  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return data.productSet.product;
};

export const ensureCustomDubraesProduct = async (admin) => {
  const existingProduct = await findCustomDubraesProduct(admin);
  const product = existingProduct || (await createCustomDubraesProduct(admin));
  const variants = getProductVariants(product);
  const { withoutCustomization, withCustomization } =
    findRequiredVariants(variants);

  if (!withoutCustomization || !withCustomization) {
    throw new Error(
      `The "${PRODUCT_TITLE}" product exists, but it does not have usable variants.`,
    );
  }

  await allowVariantsToSellWithoutInventory(admin, product.id, variants);
  await publishProductToSalesChannels(admin, product.id);

  return {
    created: !existingProduct,
    product: {
      id: product.id,
      numericId: toNumericId(product.id),
      title: product.title,
      handle: product.handle,
    },
    variants: {
      withoutCustomization,
      withCustomization,
    },
  };
};
