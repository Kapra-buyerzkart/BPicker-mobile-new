export interface FontFamilySet {
    regular: string;
    semiBold: string;
    bold: string;
    extraBold: string;
}

export const FONTS: { openSans: FontFamilySet } = {
    openSans: {
        regular: 'Poppins-Regular',
        semiBold: 'Poppins-SemiBold',
        bold: 'Poppins-Bold',
        extraBold: 'Poppins-ExtraBold',
    },
};
