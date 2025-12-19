import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../card'

describe('Card', () => {
    it('renders all subcomponents correctly', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>Card Content</CardContent>
                <CardFooter>Card Footer</CardFooter>
            </Card>
        )

        expect(screen.getByText('Card Title')).toBeInTheDocument()
        expect(screen.getByText('Card Description')).toBeInTheDocument()
        expect(screen.getByText('Card Content')).toBeInTheDocument()
        expect(screen.getByText('Card Footer')).toBeInTheDocument()
    })

    it('applies custom class names', () => {
        render(
            <Card className="custom-card">
                <CardHeader className="custom-header">
                    <CardTitle className="custom-title">Title</CardTitle>
                    <CardDescription className="custom-description">Description</CardDescription>
                </CardHeader>
                <CardContent className="custom-content">Content</CardContent>
                <CardFooter className="custom-footer">Footer</CardFooter>
            </Card>
        )

        expect(screen.getByText('Title').closest('.custom-card')).toBeInTheDocument()
        expect(screen.getByText('Title').closest('.custom-header')).toBeInTheDocument()
        expect(screen.getByText('Title')).toHaveClass('custom-title')
        expect(screen.getByText('Description')).toHaveClass('custom-description')
        expect(screen.getByText('Content')).toHaveClass('custom-content')
        expect(screen.getByText('Footer')).toHaveClass('custom-footer')
    })
})
