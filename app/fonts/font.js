import localFont from "next/font/local";

const PoppinsBlack = localFont({
    src: "./Poppins-Black.woff",
    variable: "--font-poppins-black",
    weight: "900",
});

const PoppinsBold = localFont({
    src: "./Poppins-Bold.woff",
    variable: "--font-poppins-bold",
    weight: "700",
});

const PoppinsExtraBold = localFont({
    src: "./Poppins-ExtraBold.woff",
    variable: "--font-poppins-extrabold",
    weight: "800",
});

const PoppinsExtraLight = localFont({
    src: "./Poppins-ExtraLight.woff",
    variable: "--font-poppins-extralight",
    weight: "200",
});

const PoppinsLight = localFont({
    src: "./Poppins-Light.woff",
    variable: "--font-poppins-light",
    weight: "300",
});


const PoppinsMedium = localFont({
    src: "./Poppins-Medium.woff",
    variable: "--font-poppins-medium",
    weight: "500",
});


const PoppinsRegular = localFont({
    src: "./Poppins-Regular.woff",
    variable: "--font-poppins-regular",
    weight: "400",
});

const PoppinsSemiBold = localFont({
    src: "./Poppins-SemiBold.woff",
    variable: "--font-poppins-semibold",
    weight: "600",
});

const PoppinsThin = localFont({
    src: "./Poppins-Thin.woff",
    variable: "--font-poppins-thin",
    weight: "100",
});

export {
    PoppinsBlack,
    PoppinsBold,
    PoppinsExtraBold,
    PoppinsExtraLight,
    PoppinsLight,
    PoppinsMedium,
    PoppinsRegular,
    PoppinsSemiBold,
    PoppinsThin,
}