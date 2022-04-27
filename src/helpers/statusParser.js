export default function statusParser(statusRaw) {
  let status = '';

  switch (statusRaw) {
    case "subscription_pending":
      status = "Subscription pending";
      break;
    case "subscription_submitted":
      status = "Waiting for Altcoinomy review";
      break;
    case "subscription_onboarded":
      status = "Onboarded";
      break;
    case "subscription_to_be_fixed":
      status = "Waiting your updates";
      break;
    case "subscription_rejected":
      status = "KYC rejected";
      break;
    case "subscription_to_report":
      status = "KYC rejected";
      break;
    case "subscription_acknowledged":
      status = "Subscription accepted";
      break;
    case "subscription_auto_wait_worldcheck":
      status = "Verification pending";
      break;
    default:
      status = statusRaw.replace("_", " ");
      break;
  }

  return status;
}
