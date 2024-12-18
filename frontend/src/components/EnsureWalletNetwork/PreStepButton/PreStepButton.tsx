import { buttonVariants } from "@/components/ui/button";
import { FC } from "react";

// export const WarningRoot = styled("div")({
//   cursor: "pointer",
//   borderRadius: 20,
//   background: BACKGROUND_SECONDARY_COLOR,
//   textAlign: "center",
//   border: "solid 1px " + alpha(BACKGROUND_SECONDARY_COLOR, 0.5),
//   padding: "2px 10px",
//   boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
//   "&:hover": {
//     background: BACKGROUND_SECONDARY_COLOR,
//     color: "#FFF",
//     "& .continue-link": {
//       color: TEXT_PRIMARY_COLOR
//     }
//   }
// });


/**
 * Button that shows 2 smaller lines to indicate user that there is a step to complete
 * before accessing the real feature. For example, connect wallet before accessing place order.
 */
export const PreStepButton: FC<{
  title: string;
  continuesTo: string;
  onClick: () => void;
  fullWidth?: boolean;
}> = ({ title, continuesTo, onClick, fullWidth = false }) => {
  return (
    <>
      {/* TODO: styles 
    from WarningRoot for below div */}
      <div onClick={onClick} className={`${buttonVariants()} ${fullWidth && "w-full"} flex-col`}>
        {/* Title */}
        <div className="text-xs">{continuesTo}</div>
        {/* Continue link */}
        <div className="font-extrabold text-sm">{title}</div>
      </div>
    </>
  )
}