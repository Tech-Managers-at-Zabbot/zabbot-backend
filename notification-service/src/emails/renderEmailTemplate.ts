import fs from "fs";
import path from "path";

export const renderEmailTemplate = (
  templateName: string,
  variables: Record<string, string>
): string => {
  const templatePath = path.join(
    process.cwd(),
    "notification-service",
    "src",
    "emails",
    "templates",
    templateName
  );

  let html = fs.readFileSync(templatePath, "utf8");

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, value);
  });

  return html;
};
